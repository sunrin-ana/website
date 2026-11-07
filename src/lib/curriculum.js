/**
 * AnA 커리큘럼 데이터 — /curriculum 페이지에 표시됩니다.
 * 트랙/모듈을 추가하거나 순서를 바꾸면 페이지에 그대로 반영됩니다.
 */

/** @param {string} path */
const icon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}`;

/** @type {Record<string, { label: string, src: string }>} */
export const tech = {
	html: { label: 'HTML', src: icon('html5/html5-original.svg') },
	css: { label: 'CSS', src: icon('css3/css3-original.svg') },
	js: { label: 'JavaScript', src: icon('javascript/javascript-original.svg') },
	react: { label: 'React', src: icon('react/react-original.svg') },
	vue: { label: 'Vue', src: icon('vuejs/vuejs-original.svg') },
	node: { label: 'Node.js', src: icon('nodejs/nodejs-original.svg') },
	python: { label: 'Python', src: icon('python/python-original.svg') },
	go: { label: 'Go', src: icon('go/go-original-wordmark.svg') },
	sql: { label: 'SQL', src: icon('mysql/mysql-original.svg') },
	nosql: { label: 'NoSQL', src: icon('mongodb/mongodb-original.svg') },
	flutter: { label: 'Flutter', src: icon('flutter/flutter-original.svg') },
	reactnative: { label: 'React Native', src: icon('react/react-original.svg') },
	fastapi: { label: 'FastAPI', src: icon('fastapi/fastapi-original.svg') },
	docker: { label: 'Docker', src: icon('docker/docker-original.svg') }
};

/** About 페이지 "기술 스택" — 분야별로 보여줄 아이콘 */
export const stack = [
	{ area: 'Frontend', keys: ['html', 'css', 'js', 'react', 'vue', 'flutter'] },
	{ area: 'Backend', keys: ['python', 'fastapi', 'node', 'go'] },
	{ area: 'Infra', keys: ['docker', 'sql', 'nosql'] }
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
		id: 'application',
		title: 'Application Development Track',
		summary: '웹의 기초부터 프레임워크, 서버, 데이터베이스, 모바일 앱까지.',
		modules: [
			{ id: '01', name: 'Web Development Fundamentals', tech: ['html', 'css', 'js'] },
			{ id: '02', name: 'Frontend Frameworks', tech: ['react', 'vue'] },
			{ id: '03', name: 'Backend Engineering', tech: ['node', 'python', 'go'] },
			{ id: '04', name: 'Database Management', tech: ['sql', 'nosql'] },
			{ id: '05', name: 'Mobile App Development', tech: ['flutter', 'reactnative'] }
		]
	},
	{
		id: 'architecture',
		title: 'Architecture Fundamentals Track',
		summary: '좋은 구조를 고민하기 위한 설계 원칙과 컴퓨터 과학의 기초.',
		modules: [
			{ id: '01', name: 'System Design Principles', tech: [] },
			{ id: '02', name: 'Data Structures & Algorithms', tech: [] }
		]
	}
];
