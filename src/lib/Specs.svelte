<div class="nf-section">
	<div class="spec-list">
		<div class="spec-item">
			<span class="spec-tag">[FRONTEND]</span>
			<span class="spec-fill" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・</span>
			<span class="spec-tech">... etc.</span>
			<span class="spec-date"> - 2026_ana</span>
		</div>
		<div class="spec-item">
			<span class="spec-tag">[BACKEND]</span>
			<span class="spec-fill" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・</span>
			<span class="spec-tech">FastAPI, etc.</span>
			<span class="spec-date"> - 2026_ana</span>
		</div>
		<div class="spec-item">
			<span class="spec-tag">[INFRA]</span>
			<span class="spec-fill" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・・</span>
			<span class="spec-tech">Docker, SQL, etc.</span>
			<span class="spec-date"> - 2026_ana</span>
		</div>
	</div>
</div>

<style>
	.nf-section {
		padding-bottom: 1.5rem;
		font-size: clamp(0.65rem, 1.4vw, 0.9rem);
		font-family: 'SFMono-Terminal', 'IBM Plex Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
	}

	.spec-list {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		align-items: baseline;
		row-gap: 0.3rem;
		column-gap: 0.75ch;
		overflow: hidden;
		color: #333;
	}
	.spec-item { display: contents; }
	.spec-tag {
		color: #2e7d32;
		font-weight: 600;
		white-space: nowrap;
	}
	.spec-fill {
		overflow: hidden;
		white-space: nowrap;
		min-width: 0;
		opacity: 0.45;
	}
	.spec-tech { white-space: nowrap; }
	.spec-date {
		white-space: nowrap;
		opacity: 0.5;
	}

	@media (max-width: 640px) {
		.spec-list {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
		}
		.spec-item {
			display: flex;
			align-items: baseline;
			gap: 0.5ch;
		}
		.spec-fill { display: none; }
		.spec-date { display: none; }
	}
</style>
