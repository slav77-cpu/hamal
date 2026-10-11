// Строителни услуги — без цени: цена и оферта се правят на място (по думите на бат Миро).
// „Къртене“ и „Почистване и извозване“ са от логото („Кърти · Чисти · Извозва · Пренася“).
// TODO: бат Миро потвърждава списъка и кратките описания

export type ConstructionIcon =
  | 'layers'
  | 'paint-roller'
  | 'brick-wall'
  | 'bath'
  | 'door-stairwell'
  | 'ruler'
  | 'zap'
  | 'droplets'
  | 'grid-3x3'
  | 'hammer'
  | 'brush';

export interface ConstructionService {
  title: string;
  text: string;
  icon: ConstructionIcon;
}

export const construction = {
  intro: 'Работим с няколко строителни бригади — всякакъв вид строителни услуги.',
  priceNote: 'Цени и оферти правим директно на място.',
  services: [
    { title: 'Гипсокартон', icon: 'layers', text: 'Преградни стени, окачени тавани и обшивки.' },
    { title: 'Шпакловка', icon: 'paint-roller', text: 'Подготовка на стени и тавани за боядисване.' },
    { title: 'Мазилка', icon: 'brick-wall', text: 'Мазилка на стени и тавани.' },
    { title: 'Изработка на бани', icon: 'bath', text: 'Изработка и ремонт на бани.' },
    { title: 'Стълбища', icon: 'door-stairwell', text: 'Изработка и облицовка на стълбища.' },
    { title: 'Поставяне на паркет', icon: 'ruler', text: 'Редене на паркет.' },
    { title: 'Ел. инсталация', icon: 'zap', text: 'Окабеляване, ключове, контакти и осветление.' },
    { title: 'ВиК', icon: 'droplets', text: 'Водопровод и канализация — нови инсталации и ремонти.' },
    { title: 'Лепене на плочки', icon: 'grid-3x3', text: 'Плочки за баня, кухня, под и стени.' },
    { title: 'Къртене', icon: 'hammer', text: 'Къртене на стени, плочки и замазки.' },
    { title: 'Почистване и извозване', icon: 'brush', text: 'Почистване след ремонт и извозване на строителни отпадъци.' },
  ] satisfies ConstructionService[],
};
