<script lang="ts">
  import { animate } from "animejs";
  import { onMount } from "svelte";
  import Typed from "typed.js";

  let terminal: HTMLDivElement;
  let uptimeString = "";

  function getPreciseUptime() {
    const base = new Date('2011-03-01T00:00:00+09:00');
    const now = new Date();

    let years = now.getFullYear() - base.getFullYear();
    let months = now.getMonth() - base.getMonth();
    let days = now.getDate() - base.getDate();
    let hours = now.getHours() - base.getHours();
    let minutes = now.getMinutes() - base.getMinutes();

    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    return { years, months, days, hours, minutes };
  }

  onMount(() => {
    const update = () => {
      const u = getPreciseUptime();
      uptimeString = `${u.years} years, ${u.months} months, ${u.days} days, ${u.hours} hours, ${u.minutes} mins`;
    };

    update();
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  });

  onMount(() => {
    const u = getPreciseUptime();
    uptimeString = `${u.years} years, ${u.months} months, ${u.days} days, ${u.hours} hours, ${u.minutes} mins`;

    const setChildDisplay = (index: number, display: "none" | "block") => {
      const child = terminal?.children.item(index) as HTMLElement | null;
      if (!child) return;
      child.style.display = display;
    };

    animate('#terminal', {
      onBegin: () => {
        new Typed('#anafetch', {
          strings: ["anafetch"],
          cursorChar: '▮',
          onComplete: (s) => {
            s.cursor.remove();
            setTimeout(() => setChildDisplay(1, 'block'), 500);
            setTimeout(() => {
              setChildDisplay(1, 'none');
              setChildDisplay(2, 'block');
            }, 800);
            setTimeout(() => {
              setChildDisplay(2, 'none');
              setChildDisplay(3, 'block');
            }, 1000);
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
<span class="aflc">           00000000  00000000           </span><span class="aftg">Uptime</span>: {uptimeString}
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
<span class="aflc">               0000000000               </span>  <span class="aftg">ana</span>@<span class="aftg">ana</span>
<span class="aflc">              000000000000              </span>  -------
<span class="aflc">              000000000000              </span>  <span class="aftg">OS</span>: Application & Architecture 17 neurons
<span class="aflc">             00000000000000             </span>  <span class="aftg">Host</span>: Sunrin Internet High School Rev 121.0
<span class="aflc">            0000000000000000            </span>  <span class="aftg">Kernel</span>: 120th-dept-sw (<span class="effect">! UPDATE REQUIRED</span>)
<span class="aflc">           00000000  00000000           </span>  <span class="aftg">Uptime</span>: {uptimeString}
<span class="aflc">           0000000    0000000           </span>  <span class="aftg">Packages</span>: 4 (class)
<span class="aflc">          00000000    00000000          </span>  <span class="aftg">Shell</span>: An-Shell 17.0.0
<span class="aflc">         00000000      00000000         </span>  <span class="aftg">CPU</span>: 86B * 10 @ neurons
<span class="aflc">         00000000       0000000         </span>  <span class="aftg">Memory</span>: 16B * 10 neurons
<span class="aflc">        000000000       00000000        </span>
<span class="aflc">       00000000000       00000000       </span>  <span class="aftg">Email</span>: ana@sunrint.hs.kr
<span class="aflc">       0000000 000        0000000       </span>  <span class="aftg">Location</span>: 341 @ SRIHS
<span class="aflc">      00000000 0000       00000000      </span>
<span class="aflc">     00000000   0000       00000000     </span>
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

    .effect {
      color: #B45A00;
    }
</style>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
</svelte:head>
