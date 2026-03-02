# PHASE 4 — Lead Capture & CRM Integration

This document outlines the strategy for converting an emotionally invested user (who has just designed their dream interior) into a qualified lead in the real estate developer's CRM (e.g., Salesforce, HubSpot).

## 1. The "Commitment" Hook
The lead capture occurs at the peak of user engagement: right after they have visualized their space and reviewed the cost breakdown. We present this not as a "Contact Us" form, but as a "Save My Design & Lock In Pricing" action.

## 2. Data Model (Prisma Schema Example)

We capture both the user's contact information and the context of their session. This gives the sales agent a massive advantage: they know exactly what the buyer wants before the first call.

```prisma
model Lead {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  name          String
  email         String
  phone         String?
  
  // Context
  unitId        String   // e.g., "2BHK_DELUXE_02"
  style         String   // e.g., "Modern"
  budgetTier    String   // e.g., "Premium"
  totalCost     Float    // e.g., 45000
  
  // JSON array of selected premium upgrades
  upgrades      Json?    
  
  // URLs to the AI-generated renders they saved
  savedRenders  String[] 
  
  // Sync status with external CRM
  crmSynced     Boolean  @default(false)
  crmLeadId     String?
}
```

## 3. API Endpoint (`POST /api/leads`)

The frontend will send a payload to our Next.js API route.

**Request Payload:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "unitId": "2BHK_DELUXE",
  "style": "Modern",
  "budgetTier": "Premium",
  "totalCost": 45000,
  "upgrades": ["smart_home", "premium_appliances"],
  "savedRenders": ["https://storage.example.com/render_123.jpg"]
}
```

## 4. CRM Webhook Integration

In a production environment, the Next.js API route will forward this data to the developer's CRM. 

**Example: HubSpot Contacts API**
```javascript
const hubspotPayload = {
  properties: {
    email: lead.email,
    firstname: lead.name.split(' ')[0],
    lastname: lead.name.split(' ').slice(1).join(' '),
    phone: lead.phone,
    interested_unit: lead.unitId,
    preferred_style: lead.style,
    estimated_interior_budget: lead.totalCost
  }
};
// POST to https://api.hubapi.com/crm/v3/objects/contacts
```

## 5. Frontend Implementation
1.  **Form UI:** A clean, minimal form presented in Step 4 (Reservation).
2.  **Validation:** Basic email and phone validation.
3.  **Submission State:** Loading spinners and success animations.
4.  **Confirmation:** A success screen that allows the user to download a PDF summary of their design and quote.
