// Събития към Umami (т. 11). Скриптът на Umami се добавя в етап 6; дотогава — и ако е блокиран — нищо не се случва.

type Event = 'call_click' | 'viber_click' | 'whatsapp_click' | 'calculator_used' | 'form_submit';

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

export function track(event: Event, data?: Record<string, string | number>) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Аналитиката никога не бива да чупи калкулатора или формата
  }
}
