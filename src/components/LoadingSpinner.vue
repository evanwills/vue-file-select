<template>
  <div v-if="(which = '2sqares1circle')" class="double">
    <div class="tmp tmp-45" id="boxbox">
      <span class="spinner boxbox spinner--fast spinner--rev">&boxbox;</span>
    </div>

    <div class="tmp tmp-90" id="cirscir">
      <span class="spinner cirscir">&cirscir;</span>
    </div>
  </div>

  <div v-else-if="(which = '2squares8')" class="double">
    <div class="tmp tmp-90" id="cirE">
      <span class="spinner cirE spinner--fast">&cirE;</span>
    </div>
    <div class="tmp" id="cirmid">
      <span class="spinner cirmid spinner--rev">
        &cirmid;
      </span>
    </div>
  </div>

  <div v-else-if="(which = 'cupcap')" class="double">
    <div class="tmp" id="cupcap">
      <span class="spinner cupcap spinner--x spinner--alt">
        &cupcap;
      </span>
    </div>
    <div class="tmp" id="pointint">
      <span class="spinner pointint spinner--xx spinner--4 spinner--alt-rev">
        &pointint;
      </span>
    </div>
  </div>

  <div v-else-if="(which = 'circledots')" class="double">
    <div class="tmp tmp-90" id="cirscir">
      <span class="spinner cirscir spinner--x spinner--3 spinner--alt">
        &cirscir;
      </span>
    </div>
    <div class="tmp" id="vellip">
      <span class="spinner vellip spinner--xx spinner--3 spinner--alt-rev">
        &vellip;
      </span>
    </div>
  </div>

  <div v-else-if="(which = 'star')" class="tmp" id="star">
    <span class="spinner star">&bigstar;</span>
  </div>

  <div v-else-if="(which = '8')" class="tmp tmp-90" id="cirscir">
    <span class="spinner cirscir">&cirscir;</span>
  </div>

  <div v-else-if="(which = '2squares')" class="tmp tmp-45" id="boxbox">
    <span class="spinner boxbox">&boxbox;</span>
  </div>

  <div v-else-if="(which = 'bigotimes')" class="tmp" id="bigotimes">
    <span class="spinner bigotimes">&bigotimes;</span>
  </div>

  <div
    v-else-if="(which = 'circlearrowright')"
    class="tmp"
    id="circlearrowright">
    <span class="spinner circlearrowright">&circlearrowright;</span>
  </div>

  <div v-else-if="(which = 'cirE')" class="tmp tmp-90" id="cirE">
    <span class="spinner cirE">&cirE;</span>
  </div>

  <div v-else-if="(which = 'cirmid')" class="tmp" id="cirmid">
    <span class="spinner cirmid">&cirmid;</span>
  </div>

  <div v-else-if="(which = 'cupcap')" class="tmp" id="cupcap">
    <span class="spinner cupcap">&cupcap;</span>
  </div>

  <div v-else-if="(which = 'gtcc')" class="tmp tmp-90" id="gtcc">
    <span class="spinner gtcc">&gtcc;</span>
  </div>

  <div v-else-if="(which = 'pointint')" class="tmp" id="pointint">
    <span class="spinner pointint">&pointint;</span>
  </div>

  <div v-else-if="(which = 'telrec')" class="tmp tmp--35" id="telrec">
    <span class="spinner telrec">&telrec;</span>
  </div>

  <div v-else-if="(which = 'vellip')" class="tmp" id="vellip">
    <span class="spinner vellip">&vellip;</span>
  </div>

  <div v-else class="double">
    <div class="tmp tmp--75" id="gtcc1">
      <span class="spinner gtcc spinner--xy spinner--rev spinner--alt">&gtcc;</span>
    </div>
    <div class="tmp tmp--90" id="gtcc2">
      <span class="spinner gtcc spinner--fast spinner--rev">&gtcc;</span>
    </div>
    <div class="tmp tmp-90" id="gtcc3">
      <span class="spinner gtcc spinner--x">&gtcc;</span>
    </div>
    <div class="tmp tmp--45" id="gtcc4">
      <span class="spinner gtcc spinner--xx spinner--alt">&gtcc;</span>
    </div>
  </div>
</template>

<script setup>
// for full version see
// https://codepen.io/evanwills/pen/LYJaPLV
defineProps({ which: { type: String, required: false, default: "gtcc" } });
</script>

<style>
:root {
  --size: 10rem;
}
.tmp {
  height: var(--size);
  width: var(--size);
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
.tmp--75 {
  transform: rotate(-75deg);
}
.double {
  height: var(--size);
  margin: 0.5rem;
  position: relative;
  width: var(--size);
}
.double > .tmp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.double > .tmp.tmp-90 {
  transform: translate(-50%, -50%) rotate(-90deg);
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

.pos::before,
.pos::after {
  border-radius: none;
  border: 0.05rem solid deeppink;
  content: "";
  display: block;
  position: absolute;
  z-index: 1000;
}
.pos::before {
  --pos-b-w: calc(var(--size) * (5.5 / 15));
  --pos-b-h: calc(var(--size) * (5.5 / 15));
  border-radius: 50%;
  height: var(--pos-b-h);
  left: calc(50% - calc(var(--pos-b-w) / 2));
  top: calc(50% - calc(var(--pos-b-h) / 2));
  width: var(--pos-b-w);
}
.pos::after {
  --pos-a-w: 100%;
  --pos-a-h: calc(var(--size) * 0.1);;
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
  background-color: #000;
  border-radius: 50%;
  color: #fff;
  display: block;
  font-size: calc(var(--size) * (2 / 3));;
  font-weight: bold;
  height: var(--size);
  position: relative;
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
.spinner--xy {
  animation-name: loadingSpinnerAnimation4;
  animation-duration: 6.21s;
  animation-timing-function: ease-in-out;
}
.spinner--4 {
  animation-duration: 4;
}
.spinner--3 {
  animation-duration: 3;
}
.spinner--rev {
  animation-direction: reverse;
}
.spinner--alt {
  animation-direction: alternate;
}
.spinner--alt-rev {
  animation-direction: alternate-reverse;
}
.spinner--fast {
  animation-duration: 1.5s;
}
.spinner--eio {
  animation-timing-function: ease-in-out;
}
.spinner.star {
  line-height: calc(var(--size) * (14 / 15));
  text-indent: calc(var(--size) * (3.175 / 15));
}
.spinner.cirscir {
  line-height: calc(var(--size) * (14.2 / 15));
  text-indent: calc(var(--size) * (2.3 / 15));
}
.spinner.boxbox {
  line-height: calc(var(--size) * (17.35 / 15));
  text-indent: calc(var(--size) * (2.33 / 15));
}
.spinner.bigotimes {
  line-height: calc(var(--size) * (14.1 / 15));
  text-indent: calc(var(--size) * (3 / 15));
}
.spinner.circlearrowright {
  line-height: calc(var(--size) * (14.275 / 15));
  text-indent: calc(var(--size) * (2.975 / 15));
}
.spinner.cirE {
  line-height: calc(var(--size) * (14.3 / 15));
  text-indent: calc(var(--size) * (2.45 / 15));
}
.spinner.cirmid {
  line-height: calc(var(--size) * (18.05 / 15));
  text-indent: calc(var(--size) * (5.28 / 15));
}
.spinner.cupcap {
  line-height: calc(var(--size) * (14.3 / 15));
  text-indent: calc(var(--size) * (4.59 / 15));
}
.spinner.gtcc {
  line-height: calc(var(--size) * (14.3 / 15));
  text-indent: calc(var(--size) * (1 / 15));
}
.spinner.pointint {
  line-height: calc(var(--size) * (15.1 / 15));
  text-indent: calc(var(--size) * (4.5 / 15));
}
.spinner.telrec {
  line-height: calc(var(--size) * (17.1 / 15));
  text-indent: calc(var(--size) * (3.5 / 15));
}
.spinner.vellip {
  line-height: calc(var(--size) * (14.8 / 15));
  text-indent: calc(var(--size) * (5.875 / 15));
}

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
@keyframes loadingSpinnerAnimation4 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1260deg);
  }
}
</style>
