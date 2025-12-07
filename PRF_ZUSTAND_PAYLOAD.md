# PRF Zustand Payload Structure

This document outlines the Zustand store payload structure for each step of the PRF (Project Request Form) flow.

## Overview

Each PRF step has its own dedicated Zustand store that manages state for that step. The stores are designed to be clean, unified structures where all related state is contained within a single state object.

---

## Page 1: Project Selection
**Package:** `@sis-thesqd/prf-project-selection`
**Store:** `useProjectStore`

```typescript
interface ProjectStoreState {
    // State
    selectedProjects: number[];           // Array of selected project type IDs
    projectSelectionOrder: Record<number, number>;  // Timestamps for selection order

    // Actions
    addProject: (id: number) => void;
    removeProject: (id: number) => void;
    clearProjects: () => void;
    setSelectedProjects: (ids: number[]) => void;
}
```

**Example Payload:**
```json
{
    "selectedProjects": [123, 456, 789],
    "projectSelectionOrder": {
        "123": 1701234567890,
        "456": 1701234567891,
        "789": 1701234567892
    }
}
```

---

## Page 2: General Info
**Package:** `@sis-thesqd/prf-general-info`
**Store:** `useGeneralInfoStore`

```typescript
interface GeneralInfoState {
    projectTitle: string;
    description: string;
    goLiveDate: Date | undefined;
    ministry: string | undefined;
    ministryId: number | undefined;
    audienceCategory: string | undefined;
    useBrandGuide: boolean;
    selectedBrandGuideId: number | undefined;
    allowResourceSharing: boolean;
    allowRemix: boolean;
}

interface GeneralInfoStoreState {
    // State
    formState: GeneralInfoState;

    // Actions
    updateFormState: (updates: Partial<GeneralInfoState>) => void;
    resetFormState: () => void;
    setFormState: (formState: GeneralInfoState) => void;
}
```

**Example Payload:**
```json
{
    "formState": {
        "projectTitle": "Summer Campaign 2024",
        "description": "A comprehensive campaign for the summer season",
        "goLiveDate": "2024-06-01T00:00:00.000Z",
        "ministry": "Youth Ministry",
        "ministryId": 42,
        "audienceCategory": "Teenagers",
        "useBrandGuide": true,
        "selectedBrandGuideId": 101,
        "allowResourceSharing": true,
        "allowRemix": false
    }
}
```

---

## Page 3: Creative Direction
**Package:** `@sis-thesqd/prf-creative-direction`
**Store:** `useCreativeDirectionStore`

```typescript
interface CreativeDirectionState {
    trustSquad: boolean;                              // Whether to trust the squad's creative direction
    vision: string;                                   // Creative vision description
    uploadedFiles: UploadedFile[];                    // Array of uploaded reference files
    fileDescriptions: Record<string, string>;         // Descriptions for each uploaded file
}

interface CreativeDirectionStoreState {
    // State
    creativeDirectionState: CreativeDirectionState;

    // Actions
    updateCreativeDirectionState: (updates: Partial<CreativeDirectionState>) => void;
    resetCreativeDirectionState: () => void;
    setCreativeDirectionState: (newState: CreativeDirectionState) => void;
}
```

**Example Payload:**
```json
{
    "creativeDirectionState": {
        "trustSquad": false,
        "vision": "Modern, clean aesthetic with bold typography and vibrant colors",
        "uploadedFiles": [
            {
                "id": "file-1",
                "name": "reference-image.png",
                "url": "https://storage.example.com/files/reference-image.png",
                "type": "image/png"
            }
        ],
        "fileDescriptions": {
            "file-1": "This shows the color palette we want to use"
        }
    }
}
```

---

## Page 4: Design Style
**Package:** `@sis-thesqd/prf-design-style`
**Store:** `useDesignStyleStore`

```typescript
interface DesignStyleState {
    selectedStyle: string | null;              // Selected design style name
    selectedStyleGuideId: number | null;       // Selected style guide ID
}

interface DesignStyleStoreState {
    // State
    designStyleState: DesignStyleState;

    // Actions
    updateDesignStyleState: (updates: Partial<DesignStyleState>) => void;
    resetDesignStyleState: () => void;
    setDesignStyleState: (designStyleState: DesignStyleState) => void;
}
```

**Example Payload:**
```json
{
    "designStyleState": {
        "selectedStyle": "Modern Minimal",
        "selectedStyleGuideId": 205
    }
}
```

---

## Page 5: Deliverable Details
**Package:** `@sis-thesqd/prf-deliverable-details`
**Store:** `useDeliverableDetailsStore`

```typescript
interface ProjectSubmission {
    project_submission_id: string;
    gis_id: string;
    project_type: string;
    is_primary: boolean;
    created_at: string;
    raw_data: Record<string, unknown>;
    designer_selection?: string;
    title?: string;
    project_name?: string;
}

interface DeliverableDetailsState {
    selectedProjectIds: number[];                          // Project IDs selected in Page 1
    submissions: Record<number, ProjectSubmission[]>;      // Submissions per project type
    primarySubmissionId: string | null;                    // ID of the primary submission
    primaryProjectId: number | null;                       // ID of the primary project type
    inProgressForms: Record<number, boolean>;              // Tracks forms that are started but not submitted
}

interface DeliverableDetailsStoreState {
    // State
    deliverableDetailsState: DeliverableDetailsState;

    // Actions
    updateDeliverableDetailsState: (updates: Partial<DeliverableDetailsState>) => void;
    setDeliverableDetailsState: (state: DeliverableDetailsState) => void;
    resetDeliverableDetailsState: () => void;
    addSubmission: (projectId: number, submission: ProjectSubmission) => void;
    removeSubmission: (projectId: number, submissionId: string) => void;
    setPrimarySubmission: (submissionId: string | null) => void;
    setPrimaryProject: (projectId: number | null) => void;
    setInProgressForm: (projectId: number, inProgress: boolean) => void;
    clearInProgressForms: () => void;
}
```

**Example Payload:**
```json
{
    "deliverableDetailsState": {
        "selectedProjectIds": [123, 456],
        "submissions": {
            "123": [
                {
                    "project_submission_id": "sub-abc123",
                    "gis_id": "gis-xyz789",
                    "project_type": "Social Media Graphics",
                    "is_primary": true,
                    "created_at": "2024-01-15T10:30:00.000Z",
                    "raw_data": {},
                    "title": "Instagram Post Set",
                    "project_name": "Summer Campaign Posts"
                }
            ],
            "456": [
                {
                    "project_submission_id": "sub-def456",
                    "gis_id": "gis-xyz789",
                    "project_type": "Apparel Design",
                    "is_primary": false,
                    "created_at": "2024-01-15T11:00:00.000Z",
                    "raw_data": {},
                    "title": "T-Shirt Design",
                    "project_name": "Summer Merch"
                }
            ]
        },
        "primarySubmissionId": "sub-abc123",
        "primaryProjectId": 123,
        "inProgressForms": {
            "789": true
        }
    }
}
```

---

## Persistence

Each store uses Zustand's `persist` middleware for state persistence:

| Store | Storage Type | What's Persisted |
|-------|-------------|------------------|
| Project Selection | localStorage | All state |
| General Info | localStorage | All state |
| Creative Direction | sessionStorage | All state |
| Design Style | localStorage | All state |
| Deliverable Details | localStorage | Only `inProgressForms` |

---

## Combined PRF Payload

When submitting the complete PRF, all stores are combined into a single payload:

```typescript
interface CompletePRFPayload {
    projectSelection: {
        selectedProjects: number[];
        projectSelectionOrder: Record<number, number>;
    };
    generalInfo: GeneralInfoState;
    creativeDirection: CreativeDirectionState;
    designStyle: DesignStyleState;
    deliverableDetails: DeliverableDetailsState;
}
```

**Example Combined Payload:**
```json
{
    "projectSelection": {
        "selectedProjects": [123, 456],
        "projectSelectionOrder": {
            "123": 1701234567890,
            "456": 1701234567891
        }
    },
    "generalInfo": {
        "projectTitle": "Summer Campaign 2024",
        "description": "A comprehensive campaign",
        "goLiveDate": "2024-06-01T00:00:00.000Z",
        "ministry": "Youth Ministry",
        "ministryId": 42,
        "audienceCategory": "Teenagers",
        "useBrandGuide": true,
        "selectedBrandGuideId": 101,
        "allowResourceSharing": true,
        "allowRemix": false
    },
    "creativeDirection": {
        "trustSquad": false,
        "vision": "Modern, clean aesthetic",
        "uploadedFiles": [],
        "fileDescriptions": {}
    },
    "designStyle": {
        "selectedStyle": "Modern Minimal",
        "selectedStyleGuideId": 205
    },
    "deliverableDetails": {
        "selectedProjectIds": [123, 456],
        "submissions": {},
        "primarySubmissionId": null,
        "primaryProjectId": 123,
        "inProgressForms": {}
    }
}
```
