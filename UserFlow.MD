# RetentionBrain – User Flow Diagram

This document describes the consumer journey for the RetentionBrain application.

The flow represents how a user interacts with the system from dataset upload to churn analysis and report download.

---

```mermaid
flowchart TD

    A[User Opens RetentionBrain] --> B[Landing or Dashboard Page]

    B --> C[Click Upload Dataset]
    C --> D[Select CSV File]
    D --> E[Click Submit]

    E --> F{Is File Format Valid?}

    F -->|No| G[Show File Format Error]
    G --> D

    F -->|Yes| H[Show Processing Loader]

    H --> I{Was Processing Successful?}

    I -->|No| J[Show Processing Error Message]
    J --> B

    I -->|Yes| K[Redirect to Churn Dashboard]

    K --> L[Display Summary Metrics]
    L --> M[Show Churn Distribution Chart]
    M --> N[Show High Risk Customer Table]

    N --> O{User Action?}

    O -->|Filter or Search| P[Apply Filters or Search Customer]
    P --> N

    O -->|Click Customer Row| Q[Open Customer Detail View]

    Q --> R[Display Churn Probability Score]
    R --> S[Display Risk Badge]
    S --> T[Display Top Risk Factors]
    T --> U[Display Retention Recommendation]

    U --> V{Next Action?}

    V -->|Back to Dashboard| K
    V -->|Download Customer Report| W[Download Single Customer Report]
    W --> K

    O -->|Download Full Report| X[Generate CSV Report]
    X --> Y[Download Starts]
    Y --> K


    %% ===== PREMIUM THEME =====

    classDef start fill:#ff6b6b,color:#ffffff,stroke:#8b1e3f,stroke-width:3px;
    classDef action fill:#6c63ff,color:#ffffff,stroke:#3f3d9e,stroke-width:2px;
    classDef decision fill:#00c9a7,color:#ffffff,stroke:#006d5b,stroke-width:3px;
    classDef error fill:#ff3d71,color:#ffffff,stroke:#8b1e3f,stroke-width:2px;

    %% Assign classes
    class A start

    class B,C,D,E,H,K,L,M,N,P,Q,R,S,T,U,W,X,Y action

    class F,I,O,V decision

    class G,J error

```