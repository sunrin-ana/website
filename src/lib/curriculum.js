/**
 * AnA 커리큘럼 데이터 — /curriculum 페이지에 표시됩니다.
 * 트랙/모듈을 추가하거나 순서를 바꾸면 페이지에 그대로 반영됩니다.
 */
// TODO: 서버 관련 심화반에 추가하기 + Fiber 도
/** @param {string} path */
const icon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}`;

/** @type {Record<string, { label: string, src: string }>} */
export const tech = {
	python: { label: 'Python', src: icon('python/python-original.svg') },
	sql: { label: 'SQL', src: icon('postgresql/postgresql-original.svg') },
	fastapi: { label: 'FastAPI', src: icon('fastapi/fastapi-original.svg') },
	linux: { label: 'Linux', src: icon('linux/linux-original.svg')},
	docker: { label: 'Docker', src: icon('docker/docker-original.svg') },
	nginx: { label: 'Nginx', src: icon('nginx/nginx-original.svg')},
	go: {label: 'Go', src: icon('go/go-original-wordmark.svg')},
};

/** About 페이지 "기술 스택" — 분야별로 보여줄 아이콘 */
export const stack = [
	{ area: 'Backend', keys: ['python', 'fastapi', 'go'] },
	{ area: 'Infra', keys: ['linux','docker', 'nginx'] }
];

/**
 * @type {{
 *   id: string,
 *   title: string,
 *   summary: string,
 *   modules: { id: string, name: string, tech: (keyof typeof tech)[] }[]
 * }[]}
 */
export const tracks = [
	{
		id: '일반반',
		title: '일반반',
		summary: '프로그래밍 기초부터 프레임워크, 데이터베이스, 인프라까지',
		modules: [
			{ id: '01', name: '프로그래밍 기초', tech: ['python'] },
			{ id: '02', name: '백엔드 프레임워크', tech: ['fastapi'] },
			{ id: '03', name: '데이터베이스', tech: ['sql'] },
			{ id: '04', name: '리눅스', tech: ['linux'] },
			{ id: '05', name: '인프라', tech: ['docker', 'nginx'] }
		]
	},
	{
		id: '심화반',
		title: '심화반',
		summary: 'AnA 내부서비스 개발을 위한 심화 개념',
		modules: [
			{ id: '01', name: 'Language & Framework', tech: ['go'] },
			{ id: '02', name: 'Server Management', tech: [] }
		]
	}
];
