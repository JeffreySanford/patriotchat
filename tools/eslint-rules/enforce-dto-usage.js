/**
 * Custom ESLint Rule: Enforce DTO Usage in Frontend/Backend Services
 * 
 * This rule ensures that:
 * 1. Frontend HTTP services import and use DTOs from shared library
 * 2. Backend controllers/services use typed DTOs
 * 3. Methods dealing with HTTP calls use explicit DTO types (never `any` or loose types)
 */

const sharedDtoRegex = /from ['"](@patriotchat\/shared|\.\.?\/.*types\/api\.dto)['"]/;
const httpMethodRegex = /(get|post|put|delete|patch)\(/i;
const observableReturnRegex = /Observable<|Promise<|:.*\{.*data:.*\}/;
const anyUnknownRegex = /(any|unknown)(?!\w)/;

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce DTO usage for HTTP service methods',
      category: 'Type Safety',
      recommended: true,
    },
    fixable: null,
  },
  create(context) {
    const filename = context.getFilename();
    const sourceCode = context.sourceCode;
    const isServiceFile = filename.includes('.service.ts');
    const isControllerFile = filename.includes('.controller.ts');
    const isFrontendFile = filename.includes('apps/frontend');
    const isBackendFile = filename.includes('apps/services');

    if (!isServiceFile && !isControllerFile) {
      return {};
    }

    return {
      MethodDefinition(node) {
        // Skip private methods
        if (node.accessibility === 'private') {
          return;
        }

        const methodName = node.key.name;
        const returnType = node.returnType?.typeAnnotation;

        // Check if it's an HTTP method (contains http.get, http.post, etc.)
        const methodBody = sourceCode.getText(node.value);
        const isHttpMethod = httpMethodRegex.test(methodBody);

        if (!isHttpMethod) {
          return;
        }

        // Rule 1: Frontend services must import DTOs
        if (isFrontendFile && isServiceFile) {
          const sourceCodeText = sourceCode.getText();
          if (!sharedDtoRegex.test(sourceCodeText)) {
            context.report({
              node,
              message: `Frontend service method '${methodName}' should use typed DTOs from shared library. Import DTOs from '@patriotchat/shared' or 'app/types/api.dto'.`,
            });
            return;
          }

          // Check for `any` or `unknown` in return type
          if (returnType && anyUnknownRegex.test(sourceCode.getText(returnType))) {
            context.report({
              node: returnType,
              message: `HTTP service method '${methodName}' should return a specific DTO type, not '${sourceCode.getText(returnType)}'.`,
            });
          }
        }

        // Rule 2: Backend controllers must have typed return types
        if (isBackendFile && isControllerFile) {
          if (!returnType) {
            context.report({
              node,
              message: `Backend controller method '${methodName}' must have explicit return type (not inferred). Use a DTO like 'InferenceModelsResponse'.`,
            });
            return;
          }

          // Check for `any` or `unknown`
          const returnTypeText = sourceCode.getText(returnType);
          if (anyUnknownRegex.test(returnTypeText)) {
            context.report({
              node: returnType,
              message: `Backend controller method '${methodName}' should return a specific DTO type, not '${returnTypeText}'.`,
            });
          }
        }
      },

      // Check imports in service files
      ImportDeclaration(node) {
        if (!isServiceFile) {
          return;
        }

        const source = node.source.value;
        
        // If importing from http library, check if DTOs are also imported
        if (source.includes('http') || source.includes('HttpClient')) {
          const sourceCodeText = sourceCode.getText();
          
          // For frontend services making HTTP calls, DTOs should be imported
          if (isFrontendFile && !sharedDtoRegex.test(sourceCodeText)) {
            context.report({
              node,
              message: 'Frontend service imports HttpClient but does not import DTOs. Add: import { YourDTO } from "@patriotchat/shared" or local types file.',
            });
          }
        }
      },
    };
  },
};
