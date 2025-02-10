<template>
  <div v-if="(which === '2sqares1circle')" class="double">
    <div class="wrap wrap-45" id="boxbox"><span class="spinner boxbox spinner--fast spinner--rev">&boxbox;</span></div>
    <div class="wrap wrap--90" id="cirscir"><span class="spinner cirscir">&cirscir;</span></div>
  </div>

  <div v-else-if="(which === '2squares8')" class="double">
    <div class="wrap wrap--90" id="cirE"><span class="spinner cirE spinner--fast">&cirE;</span></div>
    <div class="wrap" id="cirmid"><span class="spinner cirmid spinner--rev">&cirmid;</span></div>
  </div>

  <div v-else-if="(which === 'cupcap')" class="double">
    <div class="wrap" id="cupcap"><span class="spinner cupcap spinner--x spinner--alt">&cupcap;</span></div>
    <div class="wrap" id="pointint"><span class="spinner pointint spinner--xx spinner--4 spinner--alt-rev">&pointint;</span></div>
  </div>

  <div v-else-if="(which === 'circledots')" class="double">
    <div class="wrap wrap--90" id="cirscir"><span class="spinner cirscir spinner--x spinner--3 spinner--alt">&cirscir;</span></div>
    <div class="wrap" id="vellip"><span class="spinner vellip spinner--xx spinner--3 spinner--alt-rev">&vellip;</span></div>
  </div>

  <div v-else-if="(which === 'circlestar')" class="double">
    <div class="wrap" id="star"><span class="spinner star spinner--alt spinner--eio">&bigstar;</span></div>
    <div class="wrap wrap--90" id="cirscir"><span class="spinner cirscir spinner--alt-rev spinner--eio">&cirscir;</span></div>
  </div>

  <div v-else-if="(which === 'star')" class="wrap" id="star"><span class="spinner star">&bigstar;</span></div>

  <div v-else-if="(which === '8')" class="wrap wrap--90" id="cirscir"><span class="spinner cirscir">&cirscir;</span></div>

  <div v-else-if="(which === '2squares')" class="wrap wrap-45" id="boxbox"><span class="spinner boxbox">&boxbox;</span></div>

  <div v-else-if="(which === 'bigotimes')" class="wrap" id="bigotimes"><span class="spinner bigotimes">&bigotimes;</span></div>

  <div v-else-if="(which === 'circlearrowright')" class="wrap" id="circlearrowright">
    <span class="spinner circlearrowright">&circlearrowright;</span>
  </div>

  <div v-else-if="(which === 'cirE')" class="wrap wrap--90" id="cirE"><span class="spinner cirE">&cirE;</span></div>

  <div v-else-if="(which === 'cirmid')" class="wrap wrap-180" id="cirmid"><span class="spinner cirmid">&cirmid;</span></div>

  <div v-else-if="(which === 'cupcap')" class="wrap" id="cupcap"><span class="spinner cupcap">&cupcap;</span></div>

  <div v-else-if="(which === 'gtcc')" class="wrap wrap-90" id="gtcc"><span class="spinner gtcc">&gtcc;</span></div>

  <div v-else-if="(which === 'pointint')" class="wrap" id="pointint"><span class="spinner pointint">&pointint;</span></div>

  <div v-else-if="(which === 'telrec')" class="wrap wrap-145" id="telrec"><span class="spinner telrec">&telrec;</span></div>

  <div v-else-if="(which === 'vellip')" id="vellip"><span class="spinner vellip">&vellip;</span></div>

  <div v-else class="double">
    <div class="wrap wrap-45" id="gtcc"><span class="spinner gtcc">&gtcc;</span></div>
    <div class="wrap wrap--90" id="gtcc"><span class="spinner gtcc spinner--fast spinner--rev">&gtcc;</span></div>
    <div class="wrap wrap-90" id="gtcc"><span class="spinner gtcc spinner--x">&gtcc;</span></div>
    <div class="wrap wrap--45" id="gtcc"><span class="spinner gtcc spinner--xx spinner--alt">&gtcc;</span></div>
  </div>
</template>

<script setup>
// for full version see
// https://codepen.io/evanwills/pen/LYJaPLV
defineProps({ which: { type: String, required: false, default: "" } });
</script>

<style>
:root {
  --base-speed: 6s;
}
.wrap {
  font-family: 'Times New Roman', Times, serif;
  background-color: #000;
  border-radius: 50%;
  height: 1em;
  /* margin: 0.05rem; */
  position: relative;
  width: 1em;
}
.wrap-90 { transform: rotate(90deg); }
.wrap--90 { transform: rotate(-90deg); }
.wrap-180 { transform: rotate(180deg); }
.wrap-45 { transform: rotate(45deg); }
.wrap--45 { transform: rotate(-45deg); }
.wrap--40 { transform: rotate(-40deg); }
.wrap--35 { transform: rotate(-35deg); }
.wrap-35 { transform: rotate(35deg); }
.wrap-145 { transform: rotate(145deg); }
.double {
  background-color: #000;
  border-radius: 50%;
  height: 1em;
  margin: 0.5rem;
  position: relative;
  width: 1em;
}
.double > .wrap {
  background-color: transparent;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
.double > .wrap.wrap--90 { transform: translate(-50%, -50%)  rotate(-90deg); }
.double > .wrap.wrap--45 { transform: translate(-50%, -50%) rotate(-45deg); }
.double > .wrap.wrap-45 { transform: translate(-50%, -50%) rotate(45deg); }
.double > .wrap.wrap-90 { transform: translate(-50%, -50%)  rotate(90deg); }
.double > .wrap.wrap-180 { transform: translate(-50%, -50%) rotate(180deg); }
.double > .wrap.wrap-35 { transform: translate(-50%, -50%)  rotate(35deg); }
.double > .wrap.wrap--35 { transform: translate(-50%, -50%) rotate(-35deg); }
.double > .wrap.wrap-145 { transform: translate(-50%, -50%) rotate(-35deg); }
.double > .wrap + .wrap > .spinner {
  background-color: transparent;
  color: rgba(0, 0, 200, 0.7);
}
.double > .wrap + .wrap + .wrap > .spinner {
  background-color: transparent;
  color: rgba(0, 200, 0, 0.7);
}
.double > .wrap + .wrap + .wrap + .wrap > .spinner {
  background-color: transparent;
  color: rgba(200, 0, 0, 0.7);
}

.pos::before, .pos::after {
  border-radius: none;
  border: 0.05rem solid deeppink;
  content: '';
  display: block;
  position: absolute;
  z-index: 1000;
}
.pos::before {
  --pos-b-w: 0.3em;
  --pos-b-h: 0.3em;
  border-radius: 50%;
  height: var(--pos-b-h);
  left: calc(50% - calc(var(--pos-b-w) / 2));
  top: calc(50% - calc(var(--pos-b-h) / 2));
  width: var(--pos-b-w);
}
.pos::after {
  --pos-a-w: 100%;
  --pos-a-h: 0.1em;
  height: var(--pos-a-h);
  left: calc(50% - calc(var(--pos-a-w) / 2));
  top: calc(50% - calc(var(--pos-a-h) / 2));
  width: var(--pos-a-w);
  /* transform: rotate(90deg); */
  /* transform: rotate(35deg); */
}

.spinner {
  animation-name: loadingSpinnerAnimation;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-direction: normal;
  /* animation-timing-function: ease-in-out; */
  color: #fff;
  /* background-color: rgba(50, 50, 255, 0.7); */
  display: block;
  font-size: 1em;
  font-weight: bold;
  height: 1em;
  position: relative;
  transform-origin: 50% 50%;
  text-align: center;
  width: 1em;
}
.spinner--x {
  animation-name: loadingSpinnerAnimation2;
  animation-duration: calc(var(--base-speed) * (2 / 3));
  animation-timing-function: ease-in-out;
}
.spinner--xx {
  animation-name: loadingSpinnerAnimation3;
  animation-duration: calc(var(--base-speed) * 0.55);
  animation-timing-function: ease-in-out;
}
.spinner--4 { animation-duration: calc(var(--base-speed) * (2 / 3)); }
.spinner--3 { animation-duration: calc(var(--base-speed) / 2); }
.spinner--rev { animation-direction: reverse; }
.spinner--alt { animation-direction: alternate; }
.spinner--alt-rev { animation-direction: alternate-reverse; }
.spinner--fast { animation-duration: calc(var(--base-speed) / 4); }
.spinner--eio { animation-timing-function: ease-in-out; }
.spinner.star { line-height: 0.96em; }
.spinner.cirscir { font-size: 0.75em; left: 0.166em; line-height: 0.9125em; text-indent: -0.0075em; top: 0.1669em; }
.spinner.boxbox { font-size: 0.775em; left: 0.145em; line-height: 1.2325em; text-indent: -0.015em; top: 0.144em; }
.spinner.bigotimes { line-height: 0.91em }
.spinner.circlearrowright { line-height: 0.915em; text-indent: -0.03em; }
.spinner.cirE { font-size: 0.775em; left: 0.145em; line-height: 0.904em; text-indent: -0.0075em; top: 0.14em; }
.spinner.cirmid { left: 0.001em; line-height: 1.295em}
.spinner.cupcap { line-height: 0.93em; }
.spinner.gtcc { font-size: 0.775em; left: 0.145em; line-height: 0.919em; text-indent: -0.51em; top: 0.145em; }
.spinner.pointint { font-size: 0.8em; left: 0.1255em; line-height: 1.006em; top: 0.125em; }
.spinner.telrec { line-height: 1.202em; text-indent: -0.035em; }
.spinner.vellip { line-height: 0.975em; }

@keyframes loadingSpinnerAnimation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loadingSpinnerAnimation2 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
}
@keyframes loadingSpinnerAnimation3 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1080deg);
  }
}
</style>
