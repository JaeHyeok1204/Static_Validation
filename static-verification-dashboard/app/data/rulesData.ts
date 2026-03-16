export const rules = [
    {
        id: "MAB-001",
        name: "Signal Naming Rule",
        category: "Naming",
        description: "신호명은 기능과 단위를 식별 가능하게 작성해야 함.",
        importance: "High",
        aiComment: "재사용성과 리뷰 효율에 직접 영향이 있어 우선 관리 필요",
    },
    {
        id: "MAB-014",
        name: "Saturation Usage",
        category: "Logic",
        description: "제한 범위는 명확한 근거와 함께 설정되어야 함.",
        importance: "Medium",
        aiComment: "안전/동작 경계와 연결되므로 근거 확인 필수",
    },
    {
        id: "MAB-022",
        name: "Data Type Consistency",
        category: "Data Type",
        description: "입출력 및 내부 변수의 데이터 타입 일관성을 확보해야 함.",
        importance: "High",
        aiComment: "형 변환 오류와 다운스트림 영향 방지를 위해 중요",
    },
];