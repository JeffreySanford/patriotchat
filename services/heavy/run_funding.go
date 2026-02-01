package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strings"
	"time"
)

const proposalsPathFunding = "data/sources/funding_proposals.json"

// RunFundingFetchers fetches funding signals for all registry items and writes proposals file (not approved)
func RunFundingFetchers() error {
	srcs, err := LoadRegistry()
	if err != nil {
		return err
	}
	var props []Proposal
	now := time.Now().UTC().Format(time.RFC3339)
	for _, s := range srcs {
		// build a query string from the domain or id
		q := s.ID
		providersEnv := os.Getenv("AVAILABLE_PROVIDERS")
		providers := []string{"fec", "opencorporates", "form990", "metaads"}
		if providersEnv != "" {
			providers = strings.Split(providersEnv, ",")
		}
		fund := FundingSignals{OwnerDonations: map[string]float64{"D": 0.0, "R": 0.0}}
		evidence := []EvidenceLink{}
		providersUsed := []string{}
		providerStubs := []string{}

		for _, pName := range providers {
			switch strings.TrimSpace(strings.ToLower(pName)) {
			case "fec":
				res, evid, _ := FetchFromFEC(q)
				fund.OwnerDonations["D"] += res.D_total
				fund.OwnerDonations["R"] += res.R_total
				if evid.Type == "stub" || evid.Type == "" {
					providerStubs = append(providerStubs, "fec")
				} else {
					providersUsed = append(providersUsed, "fec")
				}
				evidence = append(evidence, evid)
			case "opencorporates":
				res, evid, _ := FetchFromOpenCorporates(q)
				fund.OwnerDonations["D"] += res.D_total
				fund.OwnerDonations["R"] += res.R_total
				if evid.Type == "stub" || evid.Type == "" {
					providerStubs = append(providerStubs, "opencorporates")
				} else {
					providersUsed = append(providersUsed, "opencorporates")
				}
				evidence = append(evidence, evid)
			case "form990":
				res, evid, _ := FetchFromForm990(q)
				fund.OwnerDonations["D"] += res.D_total
				fund.OwnerDonations["R"] += res.R_total
				if evid.Type == "stub" || evid.Type == "" {
					providerStubs = append(providerStubs, "form990")
				} else {
					providersUsed = append(providersUsed, "form990")
				}
				evidence = append(evidence, evid)
			case "metaads":
				mres, evid, _ := FetchFromMetaAds(q)
				if evid.Type == "stub" || evid.Type == "" {
					providerStubs = append(providerStubs, "metaads")
				} else {
					providersUsed = append(providersUsed, "metaads")
				}
				// attach ad-spend as an evidence excerpt
				evidence = append(evidence, EvidenceLink{URL: evid.URL, Type: "metaads", Excerpt: fmt.Sprintf("estimated_meta_ad_spend=%0.2f; %s", mres.EstimatedSpend, evid.Excerpt)})
			case "googleads":
				gres, evid, _ := FetchFromGoogleAds(q)
				if evid.Type == "stub" || evid.Type == "" {
					providerStubs = append(providerStubs, "googleads")
				} else {
					providersUsed = append(providersUsed, "googleads")
				}
				evidence = append(evidence, EvidenceLink{URL: evid.URL, Type: "googleads", Excerpt: fmt.Sprintf("estimated_google_ad_spend=%0.2f; %s", gres.EstimatedSpend, evid.Excerpt)})
			case "metaads-old":
				// backward compat alias for metaads
				mres, evid, _ := FetchFromMetaAds(q)
				evidence = append(evidence, EvidenceLink{URL: evid.URL, Type: "metaads", Excerpt: fmt.Sprintf("estimated_meta_ad_spend=%0.2f; %s", mres.EstimatedSpend, evid.Excerpt)})
			default:
				// unknown provider - skip
			}
		}

		p := Proposal{
			ID:            s.ID,
			Rationale:     fmt.Sprintf("Automated funding proposal for %s: aggregated from available providers", s.ID),
			Proposer:      "system",
			Time:          now,
			Approved:      false,
			Funding:       &fund,
			EvidenceLinks: evidence,
			ProvidersUsed: providersUsed,
			ProviderStubs: providerStubs,
		}
		props = append(props, p)
	}
	// ensure dir exists
	dir := path.Dir(proposalsPathFunding)
	os.MkdirAll(dir, 0755)
	b, _ := json.MarshalIndent(props, "", "  ")
	if err := os.WriteFile(proposalsPathFunding, b, 0644); err != nil {
		return err
	}
	// append audit entries for the registry
	srcs2, _ := LoadRegistry()
	for i := range srcs2 {
		now := time.Now().UTC().Format(time.RFC3339)
		srcs2[i].AuditLog = append(srcs2[i].AuditLog, AuditEntry{Time: now, Actor: "system", Action: "propose_funding_update", Notes: "Automated funding proposal generated; requires reviewer approval"})
	}
	writeRegistry(srcs2)
	fmt.Println("RunFundingFetchers completed: proposals written to", proposalsPathFunding)
	return nil
}

// CLI entry for convenience
func init() {
	if len(os.Args) > 1 && os.Args[1] == "fetch-propose-funding" {
		if err := RunFundingFetchers(); err != nil {
			fmt.Fprintf(os.Stderr, "RunFundingFetchers failed: %v\n", err)
			os.Exit(1)
		}
		os.Exit(0)
	}
}
