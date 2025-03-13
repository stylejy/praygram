import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.locale('ko'); // 한국어 설정
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const getFormattedTime = (isoString: string) => {
  const trimmed = isoString.slice(0, 23); // "2025-03-10T14:12:03.075"

  return dayjs(trimmed).format('YYYY년 M월 D일 A h시 m분');
};
