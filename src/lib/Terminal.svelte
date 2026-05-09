<script lang="ts">
	import { tick } from "svelte";

	let termInput = '';
	let termHistory: { cmd: string; lines: string[]; art?: boolean }[] = [];
	let termInputEl: HTMLInputElement;
	let cursorPos = 0;

	const COMMANDS: Record<string, { lines: string[]; art?: boolean }> = {
		'help': { lines: [
			'usage: <command> [args]',
			'',
			'  ls -al                    디렉토리 목록',
			'  cat ./ana/README.md       AnA 소개',
			'  cat ./ana/members.txt     부원 구성',
			'  git log --oneline         동아리 연혁',
			'  cat ./ana/motto.txt       동아리 모토',
			'  cat ./contact.json        연락처',
			'  whoami                    현재 사용자',
			'  clear                     터미널 초기화',
		]},
		'ls -al': { lines: [
			'total 48',
			'drwxr-xr-x  6 ana  sunrin   192 Mar  1 00:00 ./',
			'drwxr-xr-x  3 ana  sunrin    96 Mar  1 00:00 ../',
			'drwxr-xr-x  4 ana  sunrin   128 Mar  1 00:00 ana/',
			'drwxr-xr-x  8 ana  sunrin   256 Jan 15 12:34 projects/',
			'-rw-r--r--  1 ana  sunrin  1024 Mar  1 00:00 contact.json',
			'-rwxr-xr-x  1 ana  sunrin   512 Mar 17 12:30 apply.sh',
		]},
		'cat ./ana/members.txt': { lines: [
			'총 부원 수: 약 30명',
			'',
			'1학년  ██████████  신입 부원',
			'2학년  ████████    활동 부원',
			'3학년  ██████      선배 / 멘토',
			'',
			'── 모집: 매년 3월 ──',
		]},
		'git log --oneline': { lines: [
			'a3f1c2e (HEAD) 웹사이트 v2 리디자인 — 2025',
			'b7d4e91 웹사이트 v1 런칭 — 2023',
			'c2a9f03 GitHub 오픈소스 활동 시작 — 2021',
			'e8b1d74 AnAlog 프로젝트 시작 — 2017',
			'0000001 (origin) 동아리 창설 — 2011',
		]},
		'cat ./ana/motto.txt': { lines: [
			'',
			'  "코드로 세상을 연결한다"',
			'',
			'  Application  — 무언가를 만드는 것',
			'  Architecture — 구조를 설계하는 것',
			'',
		]},
		'cat ./contact.json': { lines: [
			'{',
			'  "email":     "ana@sunrint.hs.kr",',
			'  "instagram": "@sunrin_ana",',
			'  "github":    "github.com/sunrin-ana",',
			'  "facebook":  "fb.com/sunrinana"',
			'}',
		]},
		'whoami': { lines: ['guest — 방문자 모드로 접속 중 (read-only)'] },
		'cat ./easteregg/readme.md': { art: true, lines: [
			'',
			'          ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗',
			'          ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝',
			'          ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  ',
			'          ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  ',
			'          ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗',
			'           ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝',
			'',
			'',
			'  홈페이지: ana.st',
			'  Develop at 15/04/2026',
			'',
			'',
			'  enter "usage: <command> [args]" or "help"'
		]},
	};

	function execCommand(raw: string) {
		const cmd = raw.trim().toLowerCase();
		if (cmd === 'clear') { termHistory = []; return; }
		const entry = COMMANDS[cmd];
		const lines = entry?.lines ?? [`command not found: ${raw} — 'help'를 입력해보세요.`];
		const art = entry?.art ?? false;
		termHistory = [...termHistory, { cmd: raw, lines, art }];
		tick().then(() => {
			const el = document.querySelector('#term-scroll');
			if (el) el.scrollTop = el.scrollHeight;
		});
	}

	function syncCursor() {
		tick().then(() => {
			if (termInputEl) cursorPos = termInputEl.selectionStart ?? termInput.length;
		});
	}

	function onTermKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.isComposing) {
			execCommand(termInput);
			termInput = '';
			cursorPos = 0;
			return;
		}
		syncCursor();
	}

	export function focus() {
		termInputEl?.focus({ preventScroll: true });
	}
</script>

<div class="term-step" id="term-scroll" style="opacity: 0">
	{#each termHistory as entry}
		<div class="type-prompt">
			<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;{entry.cmd}
		</div>
		<div class="term-output" class:art={entry.art}>
			{#each entry.lines as line}
				<div>{line}</div>
			{/each}
		</div>
	{/each}
	<div class="type-prompt term-input-line" role="textbox" tabindex="0" onclick={() => { termInputEl.focus(); syncCursor(); }} onkeydown={() => termInputEl.focus()}>
		<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-dollar">$</span>&nbsp;<span class="term-typed">{termInput.slice(0, cursorPos)}<span class="term-cur blink">{termInput[cursorPos] ?? '\u00a0'}</span>{termInput.slice(cursorPos + 1)}</span>
	</div>
	<input
		bind:this={termInputEl}
		bind:value={termInput}
		onkeydown={onTermKey}
		oninput={syncCursor}
		class="term-hidden-input"
		autocomplete="off"
		spellcheck="false"
	/>
</div>

<style>
	.term-step {
		width: 100%;
		max-width: 100%;
		font-family: 'SFMono-Terminal', 'IBM Plex Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
	}
	.type-prompt {
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		color: #555;
		margin-bottom: 0.75rem;
	}
	.p-user  { color: #2e7d32; font-weight: 800; letter-spacing: -1px;}
	.p-sep   { color: #555; letter-spacing: -1px;}
	.p-path  { color: #1565c0; font-weight: 700; }
	.p-dollar { color: #333; }
	.blink { animation: blink 1s step-end infinite; }
	@keyframes blink { 50% { opacity: 0; } }

	.term-hidden-input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
	}
	.term-input-line { cursor: text; margin-bottom: 0; }
	.term-typed { white-space: pre; }
	.term-cur { background: #333; color: #f5f5f5; }
	.term-output {
		font-size: clamp(0.75rem, 1.8vw, 1rem);
		color: #444;
		margin-bottom: 0.75rem;
		padding-left: 0.5rem;
		border-left: 2px solid #ddd;
		line-height: 1.6;
	}
	.term-output.art {
		line-height: 1;
		white-space: pre;
		font-family: 'IBM Plex Mono', Menlo, Consolas, 'Courier New', monospace;
		font-size: clamp(0.45rem, 0.9vw, 0.65rem);
		overflow-x: auto;
		border-left: none;
		padding-left: 0;
	}
</style>
