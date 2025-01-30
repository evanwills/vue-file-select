<template>
  <div v-if="which = '2sqares1circle'" class="double">
    <div class="tmp tmp-45" id="boxbox"><span class="spinner boxbox spinner--fast spinner--rev">&boxbox;</span></div>
    <div class="tmp tmp-90" id="cirscir"><span class="spinner cirscir">&cirscir;</span></div>
  </div>
  <div v-else-if="which = '2squares8'" class="double">
    <div class="tmp tmp-90" id="cirE"><span class="spinner cirE spinner--fast">&cirE;</span></div>
    <div class="tmp" id="cirmid"><span class="spinner cirmid spinner--rev">&cirmid;</span></div>
  </div>
  <div v-else-if="which = 'cupcap'"  class="double">
    <div class="tmp" id="cupcap"><span class="spinner cupcap spinner--x spinner--alt">&cupcap;</span></div>
    <div class="tmp" id="pointint"><span class="spinner pointint spinner--xx spinner--4 spinner--alt-rev">&pointint;</span></div>
  </div>
  <div v-else-if="which = 'circledots'"  class="double">
    <div class="tmp tmp-90" id="cirscir"><span class="spinner cirscir spinner--x spinner--3 spinner--alt">&cirscir;</span></div>
    <div class="tmp" id="vellip"><span class="spinner vellip spinner--xx spinner--3 spinner--alt-rev">&vellip;</span></div>
  </div>
  <div v-else-if="which = 'star'"  class="tmp" id="star"><span class="spinner star">&bigstar;</span></div>
  <div v-else-if="which = '8'"  class="tmp tmp-90" id="cirscir"><span class="spinner cirscir">&cirscir;</span></div>
  <div v-else-if="which = '2squares'"  class="tmp tmp-45" id="boxbox"><span class="spinner boxbox">&boxbox;</span></div>
  <div v-else-if="which = 'bigotimes'"  class="tmp" id="bigotimes"><span class="spinner bigotimes">&bigotimes;</span></div>
  <div v-else-if="which = 'circlearrowright'"  class="tmp" id="circlearrowright"><span class="spinner circlearrowright">&circlearrowright;</span></div>
  <div v-else-if="which = 'cirE'"  class="tmp tmp-90" id="cirE"><span class="spinner cirE">&cirE;</span></div>
  <div v-else-if="which = 'cirmid'"  class="tmp" id="cirmid"><span class="spinner cirmid">&cirmid;</span></div>
  <div v-else-if="which = 'cupcap'"  class="tmp" id="cupcap"><span class="spinner cupcap">&cupcap;</span></div>
  <div v-else-if="which = 'gtcc'"  class="tmp tmp-90" id="gtcc"><span class="spinner gtcc">&gtcc;</span></div>
  <div v-else-if="which = 'pointint'"  class="tmp" id="pointint"><span class="spinner pointint">&pointint;</span></div>
  <div v-else-if="which = 'telrec'"  class="tmp tmp--35" id="telrec"><span class="spinner telrec">&telrec;</span></div>
  <div v-else-if="which = 'vellip'"  class="tmp" id="vellip"><span class="spinner vellip">&vellip;</span></div>
  <div v-else class="double">
    <div class="tmp tmp-45" id="gtcc1"><span class="spinner gtcc">&gtcc;</span></div>
    <div class="tmp tmp--90" id="gtcc"><span class="spinner gtcc spinner--fast spinner--rev">&gtcc;</span></div>
    <div class="tmp tmp-90" id="gtcc"><span class="spinner gtcc spinner--x">&gtcc;</span></div>
    <div class="tmp tmp--45" id="gtcc"><span class="spinner gtcc spinner--xx spinner--alt">&gtcc;</span></div>
  </div>
</template>

<script setup>
defineProps({ which: {type: String, required: false, default: 'gtcc'}});
</script>

<style>
.tmp {
    height: 10rem;
    width: 10rem;
    margin: 0.5rem;
    position: relative;
}
.tmp-90 {
    transform: rotate(-90deg);
}
.tmp--90 {
    transform: rotate(90deg);
}
.tmp-180 {
    transform: rotate(180deg);
}
.tmp-45 {
    transform: rotate(45deg);
}
.tmp--45 {
    transform: rotate(-45deg);
}
.tmp--40 {
    transform: rotate(-40deg);
}
.tmp--35 {
    transform: rotate(-35deg);
}
.double {
    height: 15rem;
    margin: 0.5rem;
    position: relative;
    width: 15rem;
}
.double > .tmp {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.double > .tmp.tmp-90 {
    transform: translate(-50%, -50%)  rotate(-90deg);
}
.double > .tmp.tmp-45 {
    transform: translate(-50%, -50%) rotate(45deg);
}
.double > .tmp + .tmp > .spinner {
    background-color: transparent;
    color: rgba(0, 0, 200, 0.7);
}
.double > .tmp + .tmp + .tmp > .spinner {
    background-color: transparent;
    color: rgba(0, 200, 0, 0.7);
}
.double > .tmp + .tmp + .tmp + .tmp > .spinner {
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
    --pos-b-w: 5.5rem;
    --pos-b-h: 5.5rem;
    border-radius: 50%;
    height: var(--pos-b-h);
    left: calc(50% - calc(var(--pos-b-w) / 2));
    top: calc(50% - calc(var(--pos-b-h) / 2));
    width: var(--pos-b-w);
}
.pos::after {
    --pos-a-w: 100%;
    --pos-a-h: 1.5rem;
    height: var(--pos-a-h);
    left: calc(50% - calc(var(--pos-a-w) / 2));
    top: calc(50% - calc(var(--pos-a-h) / 2));
    width: var(--pos-a-w);
    /* transform: rotate(90deg); */
    /* transform: rotate(35deg); */
}

.spinner {
    position: relative;
    animation-name: loadingSpinnerAnimation;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-direction: normal;
    /* animation-timing-function: ease-in-out; */
    background-color: #000;
    border-radius: 50%;
    color: #fff;
    display: block;
    font-size: 10rem;
    font-weight: bold;
    height: 15rem;
    transform-origin: 50% 50%;
    width: 15rem;
}
.spinner--x {
    animation-name: loadingSpinnerAnimation2;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
}
.spinner--xx {
    animation-name: loadingSpinnerAnimation3;
    animation-duration: 3.3s;
    animation-timing-function: ease-in-out;
}
.spinner--4 { animation-duration: 4; }
.spinner--3 { animation-duration: 3; }
.spinner--rev { animation-direction: reverse; }
.spinner--alt { animation-direction: alternate; }
.spinner--alt-rev { animation-direction: alternate-reverse; }
.spinner--fast { animation-duration: 1.5s; }
.spinner--eio { animation-timing-function: ease-in-out; }
.spinner.star { line-height: 14rem; text-indent: 3.175rem; }
.spinner.cirscir { line-height: 14.2rem; text-indent: 2.3rem; }
.spinner.boxbox { line-height: 17.35rem; text-indent: 2.33rem; }
.spinner.bigotimes { line-height: 14.1rem; text-indent: 3rem; }
.spinner.circlearrowright { line-height: 14.275rem; text-indent: 2.975rem; }
.spinner.cirE { line-height: 14.3rem; text-indent: 2.45rem; }
.spinner.cirmid { line-height: 18.05rem; text-indent: 5.28rem; }
.spinner.cupcap { line-height: 14.3rem; text-indent: 4.59rem; }
.spinner.gtcc { line-height: 14.3rem; text-indent: 1rem; }
.spinner.pointint { line-height: 15.1rem; text-indent: 4.5rem; }
.spinner.telrec { line-height: 17.1rem; text-indent: 3.5rem; }
.spinner.vellip { line-height: 14.8rem; text-indent: 5.875rem; }



@keyframes loadingSpinnerAnimation {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
@keyframes loadingSpinnerAnimation2 {
    from { transform: rotate(0deg); }
    to { transform: rotate(720deg); }
}
@keyframes loadingSpinnerAnimation3 {
    from { transform: rotate(0deg); }
    to { transform: rotate(1080deg); }
}
</style>
