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
 *   featured?: boolean
 * }} ArchiveItem
 */

/** @type {ArchiveItem[]} */
export const archives = [
	{
		id: 'ana-st',
		name: 'ana.st',
		tagline: 'AnA의 얼굴, 공식 웹사이트.',
		description: '동아리 소개, 아카이브, 지원 안내까지. SvelteKit과 Cloudflare 위에서 동작합니다.',
		category: 'internal',
		status: 'live',
		year: 2026,
		makers: ['AnA'],
		stack: ['SvelteKit', 'Three.js', 'Cloudflare'],
		url: 'https://ana.st',
		theme: ['#334882', '#1b2647'],
		featured: true
	},
	{
		id: 'apply',
		name: 'AnA Apply',
		tagline: '지원부터 결과까지, 한 곳에서.',
		description: '신입 부원 모집 기간에 운영되는 지원서 접수 시스템입니다.',
		category: 'internal',
		status: 'live',
		year: 2026,
		makers: ['AnA'],
		stack: ['Web'],
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
		makers: ['AnA'],
		stack: [],
		url: null,
		theme: ['#1d1d1f', '#3a3a3f']
	},
	{
		id: 'solve',
		name: 'Solve',
		tagline: '함께 풀고, 함께 성장하는 문제 풀이.',
		description: '동아리 내부 문제 풀이 및 스터디 플랫폼입니다.',
		category: 'internal',
		status: 'soon',
		year: 2026,
		makers: ['AnA'],
		stack: [],
		url: null,
		theme: ['#0f9d7a', '#0a6b54']
	}

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
