<script lang="ts">
	import { animate } from "animejs";
	import { onMount } from "svelte";
	import Typed from "typed.js";

    let terminal: HTMLDivElement;

    onMount(() => {
        animate('#terminal', {
            onBegin: () => {
                let afetch = new Typed('#anafetch', {
                    strings: ["anafetch"],
                    cursorChar: '▮',
                    onComplete: (s) => {
                        s.cursor.remove();
                        setTimeout(() => terminal.children[1].style.display = 'block', 500);
                        setTimeout(() => {terminal.children[1].style.display = 'none'; terminal.children[2].style.display = 'block'}, 800);
                        setTimeout(() => {terminal.children[2].style.display = 'none'; terminal.children[3].style.display = 'block'}, 1000);
                        console.log("SHIT");
                    },
                    typeSpeed: 30,
                });
            },
            loop: false
        })
    })
</script>

<section>
        <div id=terminal bind:this={terminal}>
        <p><span class="aflg">ana@ana</span>:<span class="aflb">~</span>$ <span id=anafetch></span></p>
        <pre style="line-height: 1.01rem; display: none;">
<span class="aflc">               0000000000               </span><span class="aftg">ana</span>@<span class="aftg">ana</span>
<span class="aflc">              000000000000              </span>-------
<span class="aflc">              000000000000              </span><span class="aftg">OS</span>: Application & Architecture 16 neurons
<span class="aflc">             00000000000000             </span><span class="aftg">Host</span>: Sunrin Internet High School Rev 120.0
<span class="aflc">            0000000000000000            </span>
<span class="aflc">           00000000  00000000           </span>
<span class="aflc">           0000000    0000000           </span>
<span class="aflc">          00000000    00000000          </span>
<span class="aflc">         00000000      00000000         </span>
<span class="aflc">         00000000       0000000         </span>
<span class="aflc">        000000000       00000000        </span>
<span class="aflc">       00000000000       00000000       </span>
<span class="aflc">       0000000 000        0000000       </span>
<span class="aflc">      00000000 0000       00000000      </span>
<span class="aflc">     00000000   000b       00000000     </span>
<span class="aflc">    000000000   0000       000000000    </span>
<span class="aflc">    00000000     0000       00000000    </span>
<span class="aflc">   00000000       000        00000000   </span>
<span class="aflc">  000000000       0000       000000000  </span>
<span class="aflc">  00000000         0000       00000000  </span>
<span class="aflc"> 00000000          00000000000000000000 </span>
<span class="aflc">000000000           00000000000000000000</span>

        </pre>
        <pre style="line-height: 1.01rem; display: none;">
<span class="aflc">               0000000000               </span><span class="aftg">ana</span>@<span class="aftg">ana</span>
<span class="aflc">              000000000000              </span>-------
<span class="aflc">              000000000000              </span><span class="aftg">OS</span>: Application & Architecture 16 neurons
<span class="aflc">             00000000000000             </span><span class="aftg">Host</span>: Sunrin Internet High School Rev 120.0
<span class="aflc">            0000000000000000            </span><span class="aftg">Kernel</span>: 120th-dept-sw
<span class="aflc">           00000000  00000000           </span><span class="aftg">Uptime</span>: 15 years, 2 days, 19hours, 52mins
<span class="aflc">           0000000    0000000           </span><span class="aftg">Packages</span>: 4 (class)
<span class="aflc">          00000000    00000000          </span><span class="aftg">Shell</span>: An-Shell 16.0.0
<span class="aflc">         00000000      00000000         </span><span class="aftg">CPU</span>: 69B * 20 @ neurons
<span class="aflc">         00000000       0000000         </span><span class="aftg">Memory</span>: 16B * 20 neurons
<span class="aflc">        000000000       00000000        </span>
<span class="aflc">       00000000000       00000000       </span>
<span class="aflc">       0000000 000        0000000       </span>
<span class="aflc">      00000000 0000       00000000      </span>
<span class="aflc">     00000000   000b       00000000     </span>
<span class="aflc">    000000000   0000       000000000    </span>
<span class="aflc">    00000000     0000       00000000    </span>
<span class="aflc">   00000000       000        00000000   </span>
<span class="aflc">  000000000       0000       000000000  </span>
<span class="aflc">  00000000         0000       00000000  </span>
<span class="aflc"> 00000000          00000000000000000000 </span>
<span class="aflc">000000000           00000000000000000000</span>

        </pre>
        <pre style="line-height: 1.01rem; display: none;">
<span class="aflc">               0000000000               </span><span class="aftg">ana</span>@<span class="aftg">ana</span>
<span class="aflc">              000000000000              </span>-------
<span class="aflc">              000000000000              </span><span class="aftg">OS</span>: Application & Architecture 16 neurons
<span class="aflc">             00000000000000             </span><span class="aftg">Host</span>: Sunrin Internet High School Rev 120.0
<span class="aflc">            0000000000000000            </span><span class="aftg">Kernel</span>: 120th-dept-sw
<span class="aflc">           00000000  00000000           </span><span class="aftg">Uptime</span>: 15 years, 2 days, 19hours, 52mins
<span class="aflc">           0000000    0000000           </span><span class="aftg">Packages</span>: 4 (class)
<span class="aflc">          00000000    00000000          </span><span class="aftg">Shell</span>: An-Shell 16.0.0
<span class="aflc">         00000000      00000000         </span><span class="aftg">CPU</span>: 69B * 20 @ neurons
<span class="aflc">         00000000       0000000         </span><span class="aftg">Memory</span>: 16B * 20 neurons
<span class="aflc">        000000000       00000000        </span>
<span class="aflc">       00000000000       00000000       </span><span class="aftg">Email</span>: ana@sunrint.hs.kr
<span class="aflc">       0000000 000        0000000       </span><span class="aftg">Location</span>: 341 @ SRIHS
<span class="aflc">      00000000 0000       00000000      </span>
<span class="aflc">     00000000   000b       00000000     </span>
<span class="aflc">    000000000   0000       000000000    </span>
<span class="aflc">    00000000     0000       00000000    </span>
<span class="aflc">   00000000       000        00000000   </span>
<span class="aflc">  000000000       0000       000000000  </span>
<span class="aflc">  00000000         0000       00000000  </span>
<span class="aflc"> 00000000          00000000000000000000 </span>
<span class="aflc">000000000           00000000000000000000</span>

        </pre>
    </div>
</section>

<style>
    section * {
        font-family: "JetBrains Mono", monospace;
        font-optical-sizing: auto;
    }

    #anafetch {
        margin: 0;
    }

    .aflc {
        color: #334882;
    }

    .aftg {
        color: #5F6987;
    }

    .aflg {
        color: limegreen;
    }

    .aflb {
        color: blue;
    }
</style>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
</svelte:head>