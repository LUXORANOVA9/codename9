# PHASE 6 — Infrastructure, ML Runtime & DevOps

This document provides the exact blueprints for deploying the Real Estate AI Kiosk application at the edge, ensuring sub-second response times for the UI and scalable GPU compute for the ML rendering.

## 1. Infrastructure Architecture Diagram (JSON)

```json
{
  "architecture": {
    "edge_layer": {
      "cdn": "AWS CloudFront (Caches static UI assets & generated renders globally)",
      "frontend_storage": "Amazon S3 (Hosts Next.js static export)",
      "render_cache": "Amazon S3 (Stores generated images/textures, sits behind CloudFront)"
    },
    "compute_layer": {
      "api_gateway": "AWS API Gateway (Routes frontend requests to backend)",
      "backend_logic": "AWS Lambda (Node.js API routes for session management & CRM sync)",
      "ml_runtime": "Modal.com OR AWS SageMaker Async Endpoints (Serverless GPU instances e.g., A10G/L40S for SDXL/ControlNet inference)"
    },
    "data_layer": {
      "database": "Amazon Aurora Serverless v2 (PostgreSQL) for relational data",
      "session_cache": "Amazon ElastiCache (Redis) for real-time kiosk state"
    },
    "integration_layer": {
      "event_bus": "AWS EventBridge (Captures lead events)",
      "crm_worker": "AWS Lambda (Transforms and pushes data to Salesforce/HubSpot)"
    }
  }
}
```

## 2. Deployment Checklist

### Edge & Frontend
*   [ ] **Configure S3 Frontend Bucket:** Create S3 bucket for static website hosting with Block Public Access enabled (access only via CloudFront OAC).
*   [ ] **Deploy Next.js:** Run `next build` and sync the `out/` directory to the S3 Frontend Bucket.
*   [ ] **Provision CloudFront:** Create a distribution pointing to the S3 origin. Attach WAF to prevent DDoS on the kiosk endpoints.
*   [ ] **Configure Render Cache:** Create a secondary S3 bucket (`renders-cache-prod`). Set CloudFront Cache Behaviors: `Cache-Control: public, max-age=31536000, immutable` for the `/renders/*` path.

### ML Runtime (Image & Texture Generation)
*   [ ] **Containerize ML Model:** Package Stable Diffusion XL + ControlNet + custom LoRAs into a Docker container with a FastAPI wrapper.
*   [ ] **Deploy Serverless GPUs:** Deploy container to Modal.com or AWS SageMaker. Configure auto-scaling rules (Scale to 0 during off-hours, max 10 concurrent GPUs during peak weekend gallery hours).
*   [ ] **Warm-up Strategy:** Implement a cron job to ping the ML endpoint 5 minutes before the sales gallery opens to avoid cold-start latency on the first customer.

### Database & API
*   [ ] **Provision DB:** Spin up Amazon Aurora Serverless v2 (PostgreSQL).
*   [ ] **Apply Schema:** Run Prisma/SQL migrations for `design_session` and `leads` tables.
*   [ ] **Deploy API:** Deploy Next.js API routes as AWS Lambda functions (using SST or Serverless Framework).

### CRM & Webhooks
*   [ ] **Configure EventBridge:** Set up a rule to listen for `lead_captured` events from the API.
*   [ ] **Deploy CRM Lambda:** Deploy the worker function that formats the payload and POSTs to the CRM.
*   [ ] **Setup DLQ:** Configure an SQS Dead Letter Queue for failed CRM webhook deliveries to ensure zero dropped leads.

## 3. Database Schema: `design_session` (JSON)

```json
{
  "tableName": "design_session",
  "description": "Tracks the user's journey and selections before they commit to becoming a lead.",
  "columns": [
    { "name": "session_id", "type": "uuid", "primaryKey": true, "default": "uuid_generate_v4()" },
    { "name": "kiosk_id", "type": "varchar(50)", "description": "Physical ID of the iPad/Screen" },
    { "name": "unit_id", "type": "varchar(100)", "description": "e.g., 2BHK_DELUXE_02" },
    { "name": "selected_style", "type": "varchar(50)", "description": "e.g., modern-warm" },
    { "name": "budget_tier", "type": "varchar(50)", "description": "standard, premium, signature" },
    { "name": "total_cost_calculated", "type": "decimal(12,2)" },
    { "name": "premium_upgrades", "type": "jsonb", "description": "Array of selected upgrade SKUs" },
    { "name": "generated_render_urls", "type": "text[]", "description": "S3/CloudFront URLs of generated images" },
    { "name": "lead_captured", "type": "boolean", "default": false },
    { "name": "lead_id", "type": "uuid", "nullable": true, "foreignKey": "leads.id" },
    { "name": "created_at", "type": "timestamp", "default": "now()" },
    { "name": "expires_at", "type": "timestamp", "description": "For TTL/cleanup of abandoned sessions" }
  ],
  "indexes": [
    { "columns": ["kiosk_id", "created_at"] },
    { "columns": ["lead_captured"] }
  ]
}
```

## 4. CRM Webhook Payload (JSON)

```json
{
  "event_type": "lead.captured",
  "event_timestamp": "2026-03-01T15:45:00Z",
  "data": {
    "lead": {
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "phone": "+1234567890",
      "move_in_timeline": "3-6 Months",
      "source": "On-Site Kiosk",
      "kiosk_id": "GALLERY_KIOSK_01"
    },
    "design_context": {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "interested_unit": "2BHK_DELUXE_02",
      "preferred_style": "Modern Warm",
      "budget_tier": "Premium",
      "estimated_interior_value": 45000.00,
      "selected_upgrades": [
        "smart_home_system",
        "hardwood_flooring"
      ],
      "portfolio_url": "https://renders.shreetisai.com/portfolio/550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```
