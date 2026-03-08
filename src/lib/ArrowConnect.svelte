<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    let sp: HTMLSpanElement | undefined;
    let current = 0;
    let dir = 1;
    let width = 8;
    let v: ReturnType<typeof setInterval> | undefined;
    export let delay: number = 0;

    function draw() {
        if (!sp) return;
        sp.innerHTML = '&lt; ';
        for (let i =0; i < width; i++) {
            if(i==current) sp.innerHTML += '<span style="color: limegreen;">=</span>';
            else sp.innerHTML += '=';
        }
        sp.innerHTML += ' &gt;';

        if(current > (width-2)) dir = -1;
        else if(current < 1) dir = 1;
        current += dir;
    }

    onMount(() => {
        setTimeout(() => {v = setInterval(() => draw(), 100);}, delay);
    })

    onDestroy(() => {
        if (v) clearInterval(v);
    })
</script>

<span bind:this={sp}></span>
