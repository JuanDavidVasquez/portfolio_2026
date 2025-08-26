<template>
  <div>
    <!-- loader -->
    <Loading v-if="loading" />

    <!-- contenido principal -->
    <main v-else class="main">
      <canvas id="shooting-stars"></canvas>

      <div class="main_content">
        <h1 class="main_title">Juan Vasquez</h1>
        <p class="main_description">Software Developer</p>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Loading from "@/components/layouts/loading.vue";

const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 2500);
});

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
    startStarsAnimation();
  }, 2500);
});

function startStarsAnimation() {
  const canvas = document.getElementById("shooting-stars") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  class ShootingStar {
    x!: number;
    y!: number;
    length!: number;
    speed!: number;
    size!: number;

    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height / 2;
      this.length = Math.random() * 80 + 10;
      this.speed = Math.random() * 10 + 6;
      this.size = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.speed;
      this.y += this.speed / 2;

      if (this.x > canvas.width || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x - this.length,
        this.y - this.length / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.size;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.length, this.y - this.length / 2);
      ctx.stroke();
    }
  }

  const stars: ShootingStar[] = [];
  for (let i = 0; i < 20; i++) {
    stars.push(new ShootingStar());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.update();
      star.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
</script>
