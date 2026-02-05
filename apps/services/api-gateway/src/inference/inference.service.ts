import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { InferenceGenerateResponse } from '../types/api.dto';
import { AxiosResponse } from 'axios';
import { getErrorMessage, AppException } from '../utils/error-handler';

interface LLMModelInfo {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  contextWindow?: number;
}

interface LLMModelsResponse {
  models: LLMModelInfo[];
}

interface LLMGenerateResponse {
  model: string;
  result: string;
  tokens: number;
  duration: string;
}

@Injectable()
export class InferenceService {
  private llmServiceUrl: string =
    process.env.LLM_SERVICE_URL || 'http://localhost:5000';

  // Model speed profiles (base milliseconds per 1000 tokens)
  private modelProfiles: Record<string, number> = {
    'neural-chat': 5000, // Fastest
    mistral: 6500,
    llama2: 8000, // Slower
  };

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    console.log(
      '[InferenceService] Constructor - HttpService available:',
      !!httpService,
    );
  }

  /**
   * Estimate time based on prompt complexity and model
   * Analyzes: prompt length, keywords, creative requests, etc.
   * Returns estimate in seconds (30-90s range for complex requests)
   */
  private estimateExecutionTime(prompt: string, model: string): number {
    const wordCount: number = prompt.trim().split(/\s+/).length;

    // Creative/complex request keywords
    const creativeKeywords: string[] = [
      'song',
      'poem',
      'story',
      'write',
      'compose',
      'create',
      'generate',
    ];
    const analyticalKeywords: string[] = [
      'analyze',
      'explain',
      'compare',
      'detailed',
      'comprehensive',
      'think',
      'consider',
      'research',
    ];

    const isCreative: boolean = creativeKeywords.some((kw: string) =>
      prompt.toLowerCase().includes(kw),
    );
    const isAnalytical: boolean = analyticalKeywords.some((kw: string) =>
      prompt.toLowerCase().includes(kw),
    );

    // Base time: 30 seconds minimum
    let estimatedMs: number = 30000;

    // Add time based on prompt length
    // ~100 words = +5 seconds for creative content
    if (isCreative) {
      estimatedMs += (wordCount / 100) * 5000;
    } else {
      estimatedMs += (wordCount / 100) * 3000;
    }

    // Creative requests need extra time (songs, poems, stories)
    if (isCreative) {
      estimatedMs += 20000; // +20 seconds for creative generation
    }

    // Analytical requests need moderate extra time
    if (isAnalytical) {
      estimatedMs += 10000; // +10 seconds for analysis
    }

    // Model-specific adjustment
    const modelSpeed: number = this.modelProfiles[model] || 6500;
    estimatedMs = (estimatedMs / 6500) * modelSpeed; // Normalize to model speed

    // Add ~15% buffer for network latency
    estimatedMs = estimatedMs * 1.15;

    // Cap at reasonable maximums (90 seconds for creative, 60 for others)
    if (isCreative) {
      estimatedMs = Math.min(estimatedMs, 90000);
    } else {
      estimatedMs = Math.min(estimatedMs, 60000);
    }

    // Convert to seconds and round up
    return Math.ceil(estimatedMs / 1000);
  }

  /**
   * Calculate dynamic timeout: 2x estimated time, minimum 60 seconds
   */
  private calculateTimeout(estimatedSeconds: number): number {
    const dynamicTimeout: number = estimatedSeconds * 2 * 1000; // Convert to ms
    return Math.max(dynamicTimeout, 60000); // Minimum 60 seconds
  }

  /**
   * Detect if request is for song generation and return system prompt
   */
  private isSongRequest(prompt: string): boolean {
    const songKeywords: string[] = [
      'write a song',
      'write song',
      'compose a song',
      'create a song',
      'generate a song',
      'write lyrics',
      'song about',
      'song in the style',
    ];
    return songKeywords.some((kw: string) =>
      prompt.toLowerCase().includes(kw.toLowerCase()),
    );
  }

  /**
   * Build system prompt for song generation with structured output
   */
  private buildSongSystemPrompt(songLengthSeconds?: number): string {
    const lengthGuidance: string = songLengthSeconds
      ? `\n\nSONG LENGTH TARGET: ${songLengthSeconds} seconds (~${Math.round(songLengthSeconds / 60)} minute(s)).\nAim for a song of this length. Include enough verses, choruses, and sections to reach this target.`
      : '';

    return `You are an expert songwriter. When asked to write a song, you MUST respond with EXACTLY this format, following EVERY instruction:

TITLE: [Song Title - creative and catchy]
GENRE: [Detailed music genre description - MUST be 200+ characters describing the musical style, mood, instrumentation, and vibe]
LYRICS:
[Song lyrics with sections clearly labeled: [VERSE], [CHORUS], [BRIDGE], [OUTRO]]

IMPORTANT:
- Genre description MUST exceed 200 characters
- Include musical elements, mood, tempo, and instrumentation in genre
- Title should be compelling and memorable
- Lyrics should have clear structure with section labels${lengthGuidance}

Example:
TITLE: American Dreams
GENRE: Patriotic ballad with acoustic guitar, soaring vocal harmonies, and orchestral swells. Features an inspiring, hopeful mood with folk-influenced melodies and powerful themes of freedom, unity, and national pride. Mid-tempo with anthemic chorus suitable for civic ceremonies and patriotic gatherings.
LYRICS:
[VERSE]
From sea to shining sea...

[CHORUS]
This land is our home...

[VERSE]
The mountains rise so tall...

[CHORUS]
This land is our home...

[BRIDGE]
Together we stand...

[OUTRO]
Our home, our pride...

STRICT RULES:
1. Always start with TITLE:
2. Always include GENRE: with 200+ character description
3. Always include LYRICS: section
4. Use [VERSE], [CHORUS], [BRIDGE], [OUTRO] tags
5. Do not include any text before TITLE: or after the lyrics
6. Follow this format exactly - no exceptions.`;
  }

  /**
   * Parse song response to extract Title, Genre, and Lyrics
   * Handles various formatting variations and ensures robust extraction
   */
  private parseSongResponse(responseText: string): {
    title: string;
    genre: string;
    lyrics: string;
  } {
    // Remove leading/trailing whitespace
    const text: string = responseText.trim();

    // Extract TITLE - match from TITLE: to newline or GENRE:
    let title: string = 'Untitled Song';
    const titleMatch: RegExpMatchArray | null = text.match(
      /^\s*TITLE:\s*(.+?)(?=\n\s*GENRE:|\nGENRE:|$)/im,
    );
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    } else {
      // Fallback: try to find TITLE anywhere
      const fallbackTitle: RegExpMatchArray | null = text.match(
        /TITLE:\s*(.+?)(?=\n|$)/i,
      );
      if (fallbackTitle && fallbackTitle[1]) {
        title = fallbackTitle[1].trim();
      }
    }

    // Extract GENRE - match from GENRE: to newline or LYRICS:
    let genre: string = 'General';
    const genreMatch: RegExpMatchArray | null = text.match(
      /^\s*GENRE:\s*(.+?)(?=\n\s*LYRICS:|\nLYRICS:|$)/im,
    );
    if (genreMatch && genreMatch[1]) {
      genre = genreMatch[1].trim();
    } else {
      // Fallback: try to find GENRE anywhere
      const fallbackGenre: RegExpMatchArray | null = text.match(
        /GENRE:\s*(.+?)(?=\n|LYRICS:|$)/i,
      );
      if (fallbackGenre && fallbackGenre[1]) {
        genre = fallbackGenre[1].trim();
      }
    }

    // Extract LYRICS - everything after LYRICS: section
    let lyrics: string = responseText;
    const lyricsMatch: RegExpMatchArray | null = text.match(
      /^\s*LYRICS:\s*\n?([\s\S]+)$/im,
    );
    if (lyricsMatch && lyricsMatch[1]) {
      lyrics = lyricsMatch[1].trim();
    } else {
      // Fallback: try simpler pattern
      const fallbackLyrics: RegExpMatchArray | null =
        text.match(/LYRICS:\n?([\s\S]+)$/i);
      if (fallbackLyrics && fallbackLyrics[1]) {
        lyrics = fallbackLyrics[1].trim();
      }
    }

    console.log('[InferenceService] Song parsed:', {
      title,
      genreLength: genre.length,
      lyricsLength: lyrics.length,
    });

    return { title, genre, lyrics };
  }

  getModels(): Observable<LLMModelInfo[]> {
    console.log(`Fetching models from: ${this.llmServiceUrl}/inference/models`);
    return this.httpService
      .get<LLMModelsResponse>(`${this.llmServiceUrl}/inference/models`, {
        timeout: 5000,
      })
      .pipe(
        tap((response: AxiosResponse<LLMModelsResponse>) => {
          console.log('Models response:', response.data);
        }),
        map(
          (response: AxiosResponse<LLMModelsResponse>) =>
            response.data.models || [
              { id: 'llama2', name: 'Llama 2', description: '' },
              { id: 'mistral', name: 'Mistral 7B', description: '' },
              { id: 'neural-chat', name: 'Neural Chat', description: '' },
            ],
        ),
        catchError(
          (error: AppException | Error): Observable<LLMModelInfo[]> => {
            const errorMessage: string = getErrorMessage(error);
            console.error(
              'Error fetching models from LLM service:',
              errorMessage,
            );
            console.warn('Returning default models due to LLM service error');
            return of([
              { id: 'llama2', name: 'Llama 2', description: 'Fallback model' },
              {
                id: 'mistral',
                name: 'Mistral 7B',
                description: 'Fallback model',
              },
              {
                id: 'neural-chat',
                name: 'Neural Chat',
                description: 'Fallback model',
              },
            ]);
          },
        ),
      );
  }

  generateInference(
    prompt: string,
    model: string,
    context?: string,
    songLengthSeconds?: number,
  ): Observable<InferenceGenerateResponse> {
    // Calculate estimated time upfront
    const estimatedTime: number = this.estimateExecutionTime(prompt, model);
    const timeout: number = this.calculateTimeout(estimatedTime);
    const isSong: boolean = this.isSongRequest(prompt);

    // Build request body with system prompt for songs
    const requestBody: Record<string, string | number> = {
      prompt,
      model,
    };

    if (context) {
      requestBody.context = context;
    }

    if (isSong) {
      requestBody.systemPrompt = this.buildSongSystemPrompt(songLengthSeconds);
      console.log(
        '[InferenceService] Song request detected, using song system prompt',
      );
      if (songLengthSeconds) {
        console.log(
          `[InferenceService] Song length preference: ${songLengthSeconds} seconds`,
        );
      }
    }

    console.log(
      `[InferenceService] Generating with model ${model}: estimated ${estimatedTime}s, timeout ${timeout}ms${isSong ? ' (Song)' : ''}`,
    );
    console.log(
      `Generating inference with model ${model} at ${this.llmServiceUrl}/inference/generate`,
    );
    return this.httpService
      .post<LLMGenerateResponse>(
        `${this.llmServiceUrl}/inference/generate`,
        requestBody,
        { timeout },
      )
      .pipe(
        tap((response: AxiosResponse<LLMGenerateResponse>) => {
          console.log('Generation response:', response.data);
        }),
        map(
          (
            response: AxiosResponse<LLMGenerateResponse>,
          ): InferenceGenerateResponse => {
            const durationNum: number = parseInt(response.data.duration, 10);
            const result: string = response.data.result || '';

            // Parse song response if it's a song request
            let responseObj: InferenceGenerateResponse = {
              model: response.data.model,
              prompt,
              text: result,
              tokens: response.data.tokens,
              duration: isNaN(durationNum) ? 0 : durationNum,
              estimatedTime,
              actualTime: durationNum,
              isSong,
            };

            if (isSong) {
              const parsed: { title: string; genre: string; lyrics: string } =
                this.parseSongResponse(result);
              responseObj = {
                ...responseObj,
                title: parsed.title,
                genre: parsed.genre,
                lyrics: parsed.lyrics,
              };
            }

            return responseObj;
          },
        ),
        catchError(
          (
            error: AppException | Error,
          ): Observable<InferenceGenerateResponse> => {
            const errorMessage: string = getErrorMessage(error);
            console.error('Error generating inference:', errorMessage);
            console.warn('Returning mock inference due to LLM service error');

            const mockResponse: InferenceGenerateResponse = {
              model,
              prompt,
              text: `Mock response from ${model}: This is a simulated inference result for the prompt: "${prompt}". In a production environment, this would be generated by the actual LLM service.`,
              tokens: 42,
              duration: 150,
              estimatedTime,
              actualTime: 150,
            };
            return of(mockResponse);
          },
        ),
      );
  }
}
