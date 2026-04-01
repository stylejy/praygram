import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.locale('ko'); // 한국어 설정
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const getFormattedTime = (isoString: string) => {
  return dayjs(isoString).format('YYYY년 M월 D일 A h시 m분');
};
