<script lang="ts">
	import Nav from "$lib/Nav.svelte";
	import { onDestroy, onMount } from "svelte";
    import { onNavigate } from "$app/navigation";
    import { waapi, stagger, onScroll, createTimeline, utils } from 'animejs';
	import ArrowConnect from "$lib/ArrowConnect.svelte";

    let link: HTMLPreElement;

    onMount(() => {
        const timeline = createTimeline();

        const world = waapi.animate('#world pre', {
            opacity: { from: 0, to: 1, duration: 1 },
            delay: stagger(100),
            onComplete: () => {
                setTimeout(() => {link.style.opacity = '1'}, 100);
            }
        });

        timeline
            .sync(world, 0)
            .call(() => {
                waapi.animate('#description p', {
                    opacity: { from: 0, to: 1, duration: 1, delay: stagger(150) },
                    delay: 1000,
                    autoplay: onScroll({
                        sync: 1,
                        enter: 'max bottom',
                        leave: 'min bottom',
                    })
                });
            });
    });

    onNavigate(() => {
        utils.remove('#description p');
        utils.remove('#world pre');
    });
</script>

<Nav></Nav>
<main>
    <section>
        <h1>We're connecting to the world</h1>
        <div style="display: flex; flex-flow:column; justify-content: center; align-items: center;">
            <div id=world>
<pre>                       .-/+oooossosso+/:.</pre>
<pre>                 `:oy@N@hyd@@dy+:::+//h@@hsso:`</pre>
<pre>              :ososN@@@@@N@@@ys``/h@yo+`..``.:oss:</pre>
<pre>           -ss/` `h@@@@@@@@@@do@@N@@@@@ooh-`````./ys:</pre>
<pre>         /y+`    /N@@@@@@@@@@@@@@@@@Ns`+/ ` ```````.+y+`</pre>
<pre>       /h/      s@@@@@@@@@@@@@@@@@@y:        `````````/h+</pre>
<pre>     .h+        /dd@@@@@@@@@@N@@dy            ``````````+d-</pre>
<pre>    /h.          /:s@@@@@sooo++o+o`            ``````````/@o</pre>
<pre>   oy`          `/yydN@@d       -:`             ``````````s@s</pre>
<pre>  +h             `-..N@@s   +d-       hd        ``````````.@@s</pre>
<pre> -@`                    /hd@: ``               ```.``.`````o@@:</pre>
<pre> h/                           od:``.........     ``````````.N@@</pre>
<pre>.N                              .-+sd@@@@@@@+::-````````````.@@:</pre>
<pre>/h                                .:y@@@@@@@@@@@/:```````````-@o</pre>
<pre>oy                                s@@@@@@@@@@@@@@@+++`````````oy</pre>
<pre>+h                                s@@@@@@@@@@@@@@@@@Noo/``````ss</pre>
<pre>.N                                s@@@@@@@@@@@@@@@@@@@@o``````d:</pre>
<pre> d/                               -/d@@@@@@@@@@@@@@@@N+.`````:@</pre>
<pre> -@`                                -:d@@@@@@@@@@@@@@o.`````.d/</pre>
<pre>  oy                                  .-N@@@@@@@@@@@@.``````sy</pre>
<pre>   sy                                `N@@@@@@@@@@h/.```````oy</pre>
<pre>    +h`                              :@@@@@@@@@hy.```````.ys</pre>
<pre>     -h/                             s@@@@@@@o+`````````/d:</pre>
<pre>       +h:                           N@@@@@:-`````````:yo`</pre>
<pre>        `+y/                       /s@@o  ``````````/yo`</pre>
<pre>           :ss:                   .N@+.``````````:sy/</pre>
<pre>             `/ss+-               `-- ```````-+ss/`</pre>
<pre>                 ./ooo+:-``` ````-:::`/:/osso/.</pre>
<pre>                      `-:+ossyhhhhhsoo+/-`</pre>
        </div>
        <pre id="link" bind:this={link} style="opacity: 0;">
○ Connecting   |   AnA <ArrowConnect/> Sunrin Internet High School
○ Connecting   |   AnA <ArrowConnect delay={600}/> World
        </pre>
        <div id="description">
            <p>안녕하세요! 👋</p>
            <p>저희는 2011년부터 <strong>선린인터넷고등학교 소프트웨어과의 전공 동아리</strong>로 활동한 AnA입니다.</p>
            <p>10년이 넘는 시간 동안 AnA는 지속적인 도전과 전진으로 새로운 미래와 혁신을 이끌어 가고 있습니다.</p>
            <br/>
            <p>처음 Algorithm & Application이라는 알고리즘 동아리로 시작하여, </p>
            <p>이후 Android & App이라는 이름으로 활동하며 안드로이드 애플리케이션 개발을 중심으로 성과를 쌓아왔습니다. </p>
            <p>이후 Application & Architecture로 변화를 맞이하며, </p>
            <p>애플리케이션 개발뿐만 아니라 이를 뒷받침하는 아키텍처 설계와 서버 구축까지 다루는 동아리로 성장했습니다.</p>
            <br/>
            <p>15년간 AnA는 기술을 배우는 것을 넘어, </p>
            <p>이를 통해 세상에 긍정적인 변화를 만들어내는 도전과 성취의 장이었습니다.</p>
            <p>그리고 이제, </p>
            <p>2025년에는 네트워크와 AI 기술까지 다루며 새로운 역사를 써 내려갈 준비를 하고 있습니다.</p>
            <br/>
            <p><strong>AnA - 우리의 도전은 멈추지 않습니다.</strong></p>
        </div>
        </div>
    </section>
</main>

<style>
    main {
        margin-top: 5rem;
        margin: 5rem 3rem 0 3rem;
    }

    main * {
        font-family: "JetBrains Mono", monospace;
        font-optical-sizing: auto;
    }

    #world pre {
        margin: 0;
        font-size: 0.75rem;
        line-height: 1rem;
        opacity: 0;
    }

    #description p {
        opacity: 0;
    }
</style>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
</svelte:head>