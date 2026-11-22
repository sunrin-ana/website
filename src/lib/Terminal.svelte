<script lang="ts">
	import { tick } from "svelte";
	let termInput = '';
	let termHistory: { cmd: string; lines: string[]; art?: boolean; path: string }[] = [];
	let termInputEl: HTMLInputElement;
	let inputLineEl: HTMLDivElement;
	let cursorPos = 0;
	let cwd = '/';

	const VFS: any = {
		'/': {
			type: 'dir',
			children: {
				'ana': { type: 'dir' },
				'easteregg': { type: 'dir' },
				'contact.json': { type: 'file' },
			}
		},
		'/ana': {
			type: 'dir',
			children: {
				'README.md': { type: 'file' },
				'motto.txt': { type: 'file' }
			}
		},
		'/easteregg': {
			type: 'dir',
			children: {
				'README.md': { type: 'file' }
			}
		}
	};

	const COMMANDS: Record<string, { lines: string[]; art?: boolean }> = {
		'help': { lines: [
				'usage: <command> [args]',
				'\n',
				'  ls [path]                 디렉토리 목록',
				'  cd [path]                 디렉토리 이동',
				'  cat [file]                파일 내용 출력',
				'  git log --oneline         동아리 연혁',
				'  whoami                    현재 사용자',
				'  clear                     터미널 초기화',
		]},
		'cat /ana/README.md': { lines: [
				'안녕하세요!',
				'저희는 2011년부터 선린인터넷고등학교 소프트웨어과의 전공 동아리로 활동한 AnA입니다.',
				'10년이 넘는 시간 동안 AnA는 지속적인 도전과 전진으로 새로운 미래와 혁신을 이끌어 가고 있습니다.',
				'\n',
				'처음 Algorithm & Application이라는 알고리즘 동아리로 시작하여, ',
				'이후 Android & App이라는 이름으로 활동하며 안드로이드 애플리케이션 개발을 중심으로 성과를 쌓아왔습니다. ',
				'이후 Application & Architecture로 변화를 맞이하며, ',
				'애플리케이션 개발뿐만 아니라 이를 뒷받침하는 아키텍처 설계와 서버 구축까지 다루는 동아리로 성장했습니다.',
				'\n',
				'16년간 AnA는 기술을 배우는 것을 넘어, ',
				'이를 통해 세상에 긍정적인 변화를 만들어내는 도전과 성취의 장이었습니다.',
				'그리고 2026년, AnA 는 새로운 역사를 써 내려갈 준비를 하고 있습니다. ',
				'\n',
				'AnA - 우리의 도전은 멈추지 않습니다.',
			]},
		'git log --oneline': { lines: [
				'a3f1c2e (HEAD) 웹사이트 v2 리디자인 — 2026',
				'b7d4e91 웹사이트 v1 런칭 — 2025',
				'e8b1d74 백엔드 동아리로 전환 — 2019',
				'0000001 (origin) 동아리 창설 — 2011',
			]},
		'cat /ana/motto.txt': { lines: [
				'\n',
				'  "어두운 곳에서 세상을 밝게 만드는 동아리"',
				'\n',
				'  Application & Architecture',
				'\n',
			]},
		'cat /contact.json': { lines: [
				'{',
				'  "email":     "ana@sunrint.hs.kr",',
				'  "instagram": "@sunrin_ana",',
				'  "github":    "github.com/sunrin-ana",',
				'  "facebook":  "fb.com/sunrinana"',
				'}',
			]},
		'whoami': { lines: ['guest — 방문자 모드로 접속 중 (read-only)'] },
		'cat /easteregg/README.md': { art: true, lines: [
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

	function resolvePath(path: string): string {
		if (!path) return cwd;
		let absolute = path.startsWith('/') ? path : (cwd === '/' ? '/' + path : cwd + '/' + path);
		
		const parts = absolute.split('/').filter(p => p !== '' && p !== '.');
		const stack: string[] = [];
		for (const part of parts) {
			if (part === '..') {
				stack.pop();
			} else {
				stack.push(part);
			}
		}
		return '/' + stack.join('/');
	}

	function getLsOutput(args: string[]) {
		const isLong = args.some(arg => arg.startsWith('-') && arg.includes('l'));
		const targetPath = resolvePath(args.find(arg => !arg.startsWith('-')) || '.');
		
		const dir = VFS[targetPath];
		if (!dir || dir.type !== 'dir') {
			return [`ls: cannot access '${targetPath}': No such directory`];
		}

		const entries = Object.keys(dir.children);
		if (isLong) {
			let output = [`total ${entries.length * 8}`];
			output.push(`drwxr-xr-x  2 ana  sunrin   64 Mar  1 00:00 .`);
			output.push(`drwxr-xr-x  2 ana  sunrin   64 Mar  1 00:00 ..`);
			for (const name of entries) {
				const entry = dir.children[name];
				const type = entry.type === 'dir' ? 'd' : '-';
				const perm = entry.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--';
				output.push(`${type}${perm}  1 ana  sunrin   512 Mar  1 00:00 ${name}${entry.type === 'dir' ? '/' : ''}`);
			}
			return output;
		} else {
			return [entries.map(name => name + (dir.children[name].type === 'dir' ? '/' : '')).join('  ')];
		}
	}

	function execCommand(raw: string) {
		const trimmed = raw.trim();
		if (!trimmed) return;
		if (trimmed === 'clear') { termHistory = []; return; }

		const parts = trimmed.split(/\s+/);
		const cmd = parts[0];
		const args = parts.slice(1);

		let lines: string[] = [];
		let art = false;
		const currentPath = cwd;

		if (cmd === 'ls') {
			lines = getLsOutput(args);
		} else if (cmd === 'cd') {
			const targetPath = resolvePath(args[0] || '/');
			if (VFS[targetPath] && VFS[targetPath].type === 'dir') {
				cwd = targetPath;
				lines = [];
			} else {
				lines = [`cd: no such directory: ${args[0]}`];
			}
		} else if (cmd === 'cat' && args.length > 0) {
			const targetPath = resolvePath(args[0]);
			const entry = COMMANDS[`cat ${targetPath}`];
			if (entry) {
				lines = entry.lines;
				art = entry.art ?? false;
			} else {
				lines = [`cat: ${args[0]}: No such file`];
			}
		} else if (cmd === 'pwd') {
			lines = [cwd];
		} else {
			const entry = COMMANDS[trimmed];
			lines = entry?.lines ?? [`command not found: ${raw} — 'help'를 입력해보세요.`];
			art = entry?.art ?? false;
		}

		termHistory = [...termHistory, { cmd: raw, lines, art, path: currentPath }];
		tick().then(() => scrollToInput('end'));
	}

	/* Scroll only the terminal's own scroll container (never the page). */
	function scrollBox(): HTMLElement | null {
		let el = inputLineEl?.parentElement ?? null;
		while (el) {
			const oy = getComputedStyle(el).overflowY;
			if (oy === 'auto' || oy === 'scroll') return el;
			el = el.parentElement;
		}
		return null;
	}

	function scrollToInput(mode: 'end' | 'nearest') {
		const box = scrollBox();
		if (!box || !inputLineEl) return;
		const behavior: ScrollBehavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
		if (mode === 'end') {
			box.scrollTo({ top: box.scrollHeight, behavior });
			return;
		}
		const b = box.getBoundingClientRect();
		const r = inputLineEl.getBoundingClientRect();
		if (r.bottom > b.bottom) box.scrollBy({ top: r.bottom - b.bottom, behavior });
		else if (r.top < b.top) box.scrollBy({ top: r.top - b.top, behavior });
	}

	function syncCursor() {
		tick().then(() => {
			if (termInputEl) {
				cursorPos = termInputEl.selectionStart ?? termInput.length;
				scrollToInput('nearest');
			}
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
		scrollToInput('nearest');
	}

	/** Run a command exactly as if it had been typed, then focus the prompt. */
	export function run(cmd: string) {
		execCommand(cmd);
		termInput = '';
		cursorPos = 0;
		termInputEl?.focus({ preventScroll: true });
	}
</script>

<div class="term-step" id="term-scroll" style="opacity: 0">
	{#each termHistory as entry}
		<div class="type-prompt">
			<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">{entry.path === '/' ? '~' : '~' + entry.path}</span><span class="p-dollar">$</span>&nbsp;{entry.cmd}
		</div>
		<div class="term-output" class:art={entry.art}>
			{#each entry.lines as line}
				<div>{line}</div>
			{/each}
		</div>
	{/each}
	<div bind:this={inputLineEl} class="type-prompt term-input-line" role="textbox" tabindex="0" onclick={() => { termInputEl.focus({ preventScroll: true }); syncCursor(); }} onkeydown={() => termInputEl.focus({ preventScroll: true })}>
		<span class="p-user">sunrin@ana</span><span class="p-sep">:</span><span class="p-path">{cwd === '/' ? '~' : '~' + cwd}</span><span class="p-dollar">$</span>&nbsp;<span class="term-typed">{termInput.slice(0, cursorPos)}<span class="term-cur blink">{termInput[cursorPos] ?? '\u00a0'}</span>{termInput.slice(cursorPos + 1)}</span>
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
		/* keeps the hidden input inside the scroll container so the browser's
		   own caret-into-view scrolling stays within the terminal */
		position: relative;
		width: 100%;
		max-width: 100%;
		font-family: 'SFMono-Terminal', 'IBM Plex Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
	}
	.type-prompt {
		/* hosts can set --term-fs (e.g. 1em) so prompt/output match the surrounding window */
		font-size: var(--term-fs, clamp(0.75rem, 1.8vw, 1rem));
		color: var(--ink-3);
		margin-bottom: 0.75rem;
	}
	.p-user  { color: light-dark(#2e7d32, #6fdc8c); font-weight: 800; letter-spacing: -1px;}
	.p-sep   { color: var(--ink-3); letter-spacing: -1px;}
	.p-path  { color: var(--brand); font-weight: 700; }
	.p-dollar { color: var(--ink-2); }
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
	.term-cur { background: var(--ink); color: var(--surface); }
	.term-output {
		white-space: pre-line;
		font-size: var(--term-fs, clamp(0.75rem, 1.8vw, 1rem));
		color: var(--ink-2);
		margin-bottom: 0.75rem;
		padding-left: 0.5rem;
		border-left: 2px solid var(--line-2);
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
