/**
 * Points of interest on the About globe.
 *
 * iconType:
 *   'hub'    – AnA (filled, logo)
 *   'server' – infrastructure node (filled)
 *   'db'     – data node (filled)
 *   'user'   – user (outlined)
 *   'spark'  – standalone highlight (filled)
 *
 * Infrastructure nodes in a group only appear while one of the user groups
 * linked to it (see `links`) is facing the viewer. Arcs connect those users
 * to the servers, and servers to their db node.
 *
 * caption / value / captionSide add a bracketed note next to the node.
 */

/** @typedef {{ lat:number, lon:number, iconType:'hub'|'server'|'db'|'user'|'spark', group?:string, value?:string, caption?:string, captionSide?:'left'|'right' }} POI */

/** @type {POI[]} */
export const pois = [
	// Korea — AnA
	{
		lat: 37.5407,
		lon: 126.9727,
		iconType: 'hub',
		group: 'kr-infra',
		value: 'Since 2011',
		caption: '선린인터넷고등학교 341호에서 시작한 소프트웨어과 전공동아리.',
		captionSide: 'right'
	},
	{ lat: 33.4996, lon: 126.5312, iconType: 'db', group: 'kr-infra' },
	{ lat: 14.5995, lon: 120.9842, iconType: 'user', group: 'g-asia' },
	{ lat: 21.0285, lon: 105.8542, iconType: 'user', group: 'g-asia' },

	// Americas
	{ lat: 40.7128, lon: -74.006, iconType: 'server', group: 'us-infra' },
	{ lat: 44.7128, lon: -70.006, iconType: 'db', group: 'us-infra' },
	{
		lat: 37.7749,
		lon: -122.4194,
		iconType: 'user',
		group: 'g-americas',
		value: 'Application',
		caption: '웹과 앱을 기획부터 출시까지 직접 만듭니다.',
		captionSide: 'left'
	},
	{
		lat: 20.1619,
		lon: -80.8515,
		iconType: 'user',
		group: 'g-americas',
		value: 'Architecture',
		caption: '애플리케이션을 뒷받침하는 서버와 데이터베이스, API를 설계합니다.',
		captionSide: 'right'
	},

	// Europe
	{ lat: 51.5074, lon: -0.1278, iconType: 'server', group: 'eu-infra' },
	{ lat: 55.3781, lon: -3.436, iconType: 'db', group: 'eu-infra' },
	{ lat: 40.4168, lon: -3.7038, iconType: 'user', group: 'g-europe' },
	{ lat: 52.2297, lon: 21.0122, iconType: 'user', group: 'g-europe' },

	// South / West Asia
	{ lat: 30.076, lon: 69.8777, iconType: 'server', group: 'in-infra' },
	{
		lat: 22.2048,
		lon: 57.2708,
		iconType: 'server',
		group: 'in-infra',
		value: 'Infrastructure',
		caption: '만든 서비스를 직접 배포하고 운영합니다.',
		captionSide: 'left'
	},
	{ lat: 12.9716, lon: 77.5946, iconType: 'db', group: 'in-infra' },
	{ lat: 28.076, lon: 72.8777, iconType: 'user', group: 'g-india' },
	{ lat: 25.2048, lon: 55.2708, iconType: 'user', group: 'g-india' },

	// Standalone
	{
		lat: 37.5074,
		lon: -7.1278,
		iconType: 'spark',
		value: '3 names',
		caption: 'Algorithm & Application → Android & App → Application & Architecture',
		captionSide: 'left'
	}
];

/** infrastructure group → user groups that connect to it */
export const links = {
	'kr-infra': ['g-asia'],
	'us-infra': ['g-americas'],
	'eu-infra': ['g-europe'],
	'in-infra': ['g-india']
};
