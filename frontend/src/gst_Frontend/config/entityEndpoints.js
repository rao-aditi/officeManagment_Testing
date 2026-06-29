export const ENTITY_ENDPOINTS = {
  "ALL": "ALL",
  "01": "/api/individual",
  "03": "/api/huf",
  "05": "/api/firm",
  "07": "/api/aop",
  "08": "/api/trust",
  "09": "/api/body-of-individual",
  "10": "/api/artificial-juridical-person",
  "11": "/api/cooperative-society",
  "12": "/api/companies/public",
  "13": "/api/companies/public-not-interested",
  "14": "/api/companies/private",
  "16": "/api/local-authority",
};

export const STATUS_TO_ENTITY_TYPE = {
  ALL: "ALL",
  "01": "INDIVIDUAL",
  "03": "HUF",
  "05": "FIRM",
  "07": "AOP",
  "08": "AOP_TRUST",
  "09": "BODY_OF_INDIVIDUAL",
  "10": "ARTIFICIAL_JUDICIAL_PERSON",
  "11": "COOPERATIVE_SOCIETY",
  "12": "COMPANY_PUBLIC_INTERESTED",
  "13": "COMPANY_PUBLIC_NOT_INTERESTED",
  "14": "COMPANY_PRIVATE",
  "16": "LOCAL_AUTHORITY",
};

export const ENTITY_TYPE_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_ENTITY_TYPE).map(([status, entityType]) => [entityType, status])
);