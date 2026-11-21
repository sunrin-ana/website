/**
 * AnA 연혁 — About 페이지의 "연혁" 칸에 표시됩니다.
 * 빈 칸은 자리 표시(회색 막대)로 보이고, 내용을 채우면 그대로 나타납니다.
 * 칸 수를 늘리거나 줄이려면 항목을 추가/삭제하세요. (3칸씩 한 줄)
 *
 * year:  '2011' 같은 연도 (또는 '2011.03' 등)
 * title: 한 줄 제목
 * body:  짧은 설명 (선택)
 *
 * @type {{ year: string, title: string, body?: string }[]}
 */
export const history = [
	{ year: '2011', title: '동아리 설립', body: ' ' },
	{ year: '2016', title: 'Android & Application', body: 'App, IoT 개발' },
	{ year: '2017', title: 'Android & Application', body: 'App, Web 개발, Algorithm 연구' },
	{ year: '2019', title: 'Application & Architecture', body: '백엔드 개발 동아리로의 전환' },
	{ year: '2024', title: 'Application & Architecture', body: '자체 서버 보유' },
	{ year: '2026', title: 'Application & Architecture', body: '혁명적부원들!' },
];
