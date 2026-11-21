/**
 * AnA Archives 데이터.
 * 새 서비스를 소개하려면 아래 배열에 항목을 추가하세요.
 *
 * category: 'member'   → 부원이 개발한 서비스
 *           'internal' → AnA 내부 서비스
 * status:   'live' | 'beta' | 'soon' | 'archived'
 * theme:    카드 배경 그라디언트 [시작색, 끝색]
 * url:      서비스 주소 (없으면 null)
 * featured: true 이면 /archives 상단 대형 타일로 노출
 * summary:  /archives 목록에 보일 한 줄 설명 (없으면 description 사용)
 *
 * ── 상세 페이지(/archives/<id>)용 선택 항목 ──
 * repo:       소스 코드 주소 (없으면 생략)
 * overview:   상세 설명 문단 배열. 없으면 description을 사용합니다.
 * screens:    기기 목업에 넣을 스크린샷. static/archives/<id>/ 에 파일을 넣고 경로를 적으세요.
 *             { desktop, mobile } 은 라이트 모드, desktopDark / mobileDark 는 다크 모드용(선택).
 *             권장 크기: desktop 2880×1800, mobile 780×1688. 없으면 테마 색 스플래시가 표시됩니다.
 * highlights: 주요 기능 소개. [{ title, body, device: 'desktop' | 'mobile', image, imageDark?, alt? }]
 *             alt 는 스크린샷에 보이는 내용 설명(선택). 제목이 이미 설명하면 생략하세요.
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   tagline: string,
 *   description: string,
 *   category: 'member' | 'internal',
 *   status: 'live' | 'beta' | 'soon' | 'archived',
 *   year: number,
 *   makers: string[],
 *   stack: string[],
 *   url: string | null,
 *   theme: [string, string],
 *   featured?: boolean,
 *   summary?: string,
 *   repo?: string,
 *   overview?: string[],
 *   screens?: { desktop?: string, mobile?: string, desktopDark?: string, mobileDark?: string },
 *   highlights?: { title: string, body: string, device: 'desktop' | 'mobile', image?: string, imageDark?: string, alt?: string }[]
 * }} ArchiveItem
 */

/** @type {ArchiveItem[]} */
export const archives = [
	{
		id: 'ana-st',
		name: 'ana.st',
		tagline: 'AnA 공식 웹사이트',
		summary: 'AnA 공식 웹사이트',
		description: '동아리 소개, 아카이브, 지원 안내까지. SvelteKit과 Cloudflare 위에서 동작합니다.',
		category: 'internal',
		status: 'live',
		year: 2026,
		makers: ['AnA ISDT'],
		stack: ['SvelteKit', 'Three.js', 'Cloudflare'],
		url: 'https://ana.st',
		theme: ['#334882', '#1b2647'],
		featured: true,
		overview: [
			'ana.st는 AnA를 처음 만나는 곳입니다. 동아리 소개와 커리큘럼, 부원들이 만든 서비스, 지원 안내를 한 사이트에 모았습니다.',
			'SvelteKit으로 만들고 Cloudflare에 배포합니다. About 페이지의 지구본은 Three.js로 직접 그렸고, 화면은 브라우저의 라이트·다크 설정을 그대로 따라갑니다.'
		],
		screens: {
			desktop: '/archives/ana-st/desktop.webp',
			desktopDark: '/archives/ana-st/desktop-dark.webp',
			mobile: '/archives/ana-st/mobile.webp',
			mobileDark: '/archives/ana-st/mobile-dark.webp'
		},
		highlights: [
			{
				title: '직접 그린 지구본',
				body: 'Three.js로 대륙을 점으로 찍어 만든 지구본입니다. 드래그해서 돌려볼 수 있고, 지점 사이를 잇는 선이 자라났다 사라집니다.',
				device: 'desktop',
				image: '/archives/ana-st/globe.webp',
				imageDark: '/archives/ana-st/globe-dark.webp'
			},
			{
				title: '부원들이 만든 서비스',
				body: 'Archives에서 동아리 내부 서비스와 부원 프로젝트를 한눈에 볼 수 있습니다. 항목은 archives.js 한 파일로 관리합니다.',
				device: 'desktop',
				image: '/archives/ana-st/archives.webp',
				imageDark: '/archives/ana-st/archives-dark.webp'
			},
			{
				title: '어느 화면에서나',
				body: '휴대폰에서도 같은 구성을 그대로 볼 수 있도록 모든 페이지를 한 열 레이아웃으로 다시 배치합니다.',
				device: 'mobile',
				image: '/archives/ana-st/mobile-about.webp',
				imageDark: '/archives/ana-st/mobile-about-dark.webp'
			}
		]
	},
	{
		id: 'anapply',
		name: 'AnApply',
		tagline: '지원부터 결과까지, 한 곳에서.',
		description: '신입 부원 모집 기간에 운영되는 지원서 접수 시스템입니다.',
		category: 'internal',
		status: 'live',
		year: 2026,
		makers: ['AnA ISDT'],
		stack: ['Web','Spring'],
		url: 'https://apply.ana.st/',
		theme: ['#ff7a3d', '#e2492a'],
		featured: true
	},
	{
		id: 'analog',
		name: 'AnAlog',
		tagline: '우리가 배우고 만든 것들의 기록.',
		description: '부원들의 기술 블로그이자 활동 기록 공간입니다.',
		category: 'internal',
		status: 'soon',
		year: 2026,
		makers: ['AnA ISDT'],
		stack: [],
		url: null,
		theme: ['#1d1d1f', '#3a3a3f']
	},
	// {
	// 	id: 'solve',
	// 	name: 'Solve',
	// 	tagline: '함께 풀고, 함께 성장하는 문제 풀이.',
	// 	description: '동아리 내부 문제 풀이 및 스터디 플랫폼입니다.',
	// 	category: 'internal',
	// 	status: 'soon',
	// 	year: 2026,
	// 	makers: ['AnA'],
	// 	stack: [],
	// 	url: null,
	// 	theme: ['#0f9d7a', '#0a6b54']
	// }

	// 부원 프로젝트 예시 — 주석을 풀고 내용을 채워주세요.
	// {
	// 	id: 'my-project',
	// 	name: '프로젝트 이름',
	// 	tagline: '한 줄 소개.',
	// 	description: '조금 더 긴 설명.',
	// 	category: 'member',
	// 	status: 'live',
	// 	year: 2026,
	// 	makers: ['홍길동'],
	// 	stack: ['React', 'FastAPI'],
	// 	url: 'https://example.com',
	// 	theme: ['#6e56cf', '#3b2a8a'],
	// 	featured: false
	// }
];

export const categoryLabels = {
	all: '전체',
	member: '부원 프로젝트',
	internal: '내부 서비스'
};

export const statusLabels = {
	live: '운영 중',
	beta: '베타',
	soon: '준비 중',
	archived: '보관됨'
};
