const DEVELOPMENT_BASE_POINT_TICKET_CODE = [
    '3800001',
    '3800002',
    '3900001',
    '3900002'
];

export const DEVELOPMENT_POINT_TICKET = [
    {
        THEATER: '101',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '112',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '116',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '118',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '119',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_POINT_TICKET_CODE
        ]
    }
];

const PRODUCTION_BASE_POINT_TICKET_CODE = [
    '4000011',
    '4000012',
    '4000013',
    '4000021',
    '4000022',
    '4000023'
];

export const PRODUCTION_POINT_TICKET = [
    {
        THEATER: '001',
        TICKET_CODE: [
            ...PRODUCTION_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '012',
        TICKET_CODE: [
            ...PRODUCTION_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '016',
        TICKET_CODE: [
            ...PRODUCTION_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '018',
        TICKET_CODE: [
            ...PRODUCTION_BASE_POINT_TICKET_CODE
        ]
    },
    {
        THEATER: '019',
        TICKET_CODE: [
            ...PRODUCTION_BASE_POINT_TICKET_CODE
        ]
    }
];

const DEVELOPMENT_BASE_MEMBER_TICKET_CODE = [
    '3100011',　   // メンバーズ一般
    '132',      　 // メンバースデイ
    '3100021'   　 // メンバーズ大学生
];

export const DEVELOPMENT_MEMBER_TICKET = [
    {
        THEATER: '101',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '112',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '116',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '118',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '119',
        TICKET_CODE: [
            ...DEVELOPMENT_BASE_MEMBER_TICKET_CODE
        ]
    }
];

const PRODUCTION_BASE_MEMBER_TICKET_CODE = [
    '4000031',　   // ｱﾌﾟﾘ会員ﾃﾞｰ
    '4000032',　   // ｱﾌﾟﾘ会員ﾃﾞｰ3D
    '4000033'　    // ｱﾌﾟﾘ会員ﾃﾞｰ★3D
];

export const PRODUCTION_MEMBER_TICKET = [
    {
        THEATER: '001',
        TICKET_CODE: [
            ...PRODUCTION_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '012',
        TICKET_CODE: [
            ...PRODUCTION_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '016',
        TICKET_CODE: [
            ...PRODUCTION_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '018',
        TICKET_CODE: [
            ...PRODUCTION_BASE_MEMBER_TICKET_CODE
        ]
    },
    {
        THEATER: '019',
        TICKET_CODE: [
            ...PRODUCTION_BASE_MEMBER_TICKET_CODE
        ]
    }
];
