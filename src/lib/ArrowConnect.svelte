<script>
    import { onDestroy, onMount } from "svelte";

    let sp;
    let current = 0;
    let dir = 1;
    let width = 8;
    let v;
    export let delay = 0;

    function draw() {
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
        clearInterval(v);
    })
</script>

<span bind:this={sp}></span>