export function getButtonList() {
    return [
        {
            label: 'Мои интересы',
            action: '/',
            active: true,
            status: 0,
            class: 'border-[#0017FC] bg-[#F9FAFB] text-[#0017FC] hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10 hover:text-[#0017FC]',
        },
        {
            label: 'Фильтры',
            action: '/',
            active: false,
            status: 1,
            class: 'border-[#D0D4DB] bg-[#FFF] hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10 hover:text-[#0017FC]'
        },
        {
            label: 'Пользователи ',
            action: '/',
            active: false,
            status: 2,
            class: 'border-[#D0D4DB] bg-[#FFF] text-[#858FA3] cursor-not-allowed'
        },
    ];
}