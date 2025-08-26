<template>
  <transition name="loading-fade" appear>
    <div v-if="show" class="loading">
      <div class="loading__circle" :class="{ 'rainbow': useRainbow }">
        <div class="loading__progress" :style="{ '--progress-angle': `${percentage * 3.6}deg` }"></div>
        <div class="loading__needle" :style="{ transform: `translate(-50%, -100%) rotate(${needleRotation}deg)` }"></div>
        <div class="loading__center"></div>
        <div class="loading__percentage">{{ Math.round(percentage) }}%</div>
      </div>
      <p class="loading__text">{{ loadingText }}</p>
      <div class="loading__dots" v-if="showDots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">

// Extending the Window interface to include $nuxt
declare global {
  interface Window {
    $nuxt?: {
      $loading?: {
        finish: () => void;
      };
    };
  }
}
// Props opcionales
interface Props {
  duration?: number
  useRainbow?: boolean
  showDots?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000,
  useRainbow: false,
  showDots: true
})

// Estado reactivo
const show = ref(true)
const percentage = ref(0)
const needleRotation = ref(-90)
const loadingText = ref('Cargando...')
const isPageLoaded = ref(false)
const isFinishing = ref(false)

// Variables para intervalos
let progressInterval: NodeJS.Timeout | null = null
let needleInterval: NodeJS.Timeout | null = null

// Textos de loading aleatorios
const loadingTexts = [
  'Cargando...',
  'Preparando contenido...',
  'Casi listo...',
  'Configurando...',
  'Iniciando aplicación...'
]

// Métodos
const startProgress = () => {
  const progressSpeed = 50
  
  progressInterval = setInterval(() => {
    if (!isPageLoaded.value && !isFinishing.value) {
      // Progreso más lento hasta que la página se cargue
      if (percentage.value < 85) {
        percentage.value += Math.random() * 1.5 // Progreso irregular hasta 85%
        
        // Cambiar texto ocasionalmente
        if (percentage.value > 20 && Math.random() < 0.02) {
          loadingText.value = loadingTexts[Math.floor(Math.random() * loadingTexts.length)] || 'Cargando...'
        }
      } else if (percentage.value < 95) {
        percentage.value += 0.3 // Muy lento entre 85-95%
        loadingText.value = 'Finalizando carga...'
      }
    } else if (!isFinishing.value) {
      // Una vez cargada, comenzar finalización
      isFinishing.value = true
      loadingText.value = 'Completando...'
    }
    
    if (isFinishing.value) {
      if (percentage.value < 100) {
        percentage.value += 4 // Completar rápidamente
      } else {
        percentage.value = 100
        loadingText.value = '¡Listo!'
        setTimeout(finishLoading, 800)
      }
    }
  }, progressSpeed)
}

const startNeedleAnimation = () => {
  needleInterval = setInterval(() => {
    needleRotation.value = -90 + (percentage.value * 3.6)
  }, 16) // 60 FPS aproximadamente
}

const listenForPageLoad = () => {
  // Detectar si ya está cargado
  if (process.client) {
    if (document.readyState === 'complete') {
      setTimeout(() => {
        isPageLoaded.value = true
      }, 1000)
    } else {
      // Escuchar evento load
      window.addEventListener('load', () => {
        setTimeout(() => {
          isPageLoaded.value = true
        }, 500)
      })
    }

    // Para navegación SPA
    const router = useRouter()
    router.beforeEach(() => {
      // Reset cuando cambie la ruta
      resetLoading()
      return true
    })

    router.afterEach(() => {
      // Marcar como cargado después de navegación
      setTimeout(() => {
        isPageLoaded.value = true
      }, 800)
    })
  }

  // Timeout de seguridad (máximo 12 segundos)
  setTimeout(() => {
    if (!isPageLoaded.value && !isFinishing.value) {
      isPageLoaded.value = true
      loadingText.value = 'Completando carga...'
    }
  }, 12000)
}

const resetLoading = () => {
  percentage.value = 0
  needleRotation.value = -90
  isPageLoaded.value = false
  isFinishing.value = false
  loadingText.value = 'Cargando...'
  show.value = true
}

const finishLoading = () => {
  clearIntervals()
  
  // Fade out suave
  setTimeout(() => {
    show.value = false
    
    // Notificar a Nuxt que el loading terminó
    nextTick(() => {
      if (process.client && window.$nuxt?.$loading?.finish) {
        window.$nuxt.$loading.finish()
      }
    })
  }, 300)
}

const clearIntervals = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (needleInterval) {
    clearInterval(needleInterval)
    needleInterval = null
  }
}

// Lifecycle hooks
onMounted(() => {
  startProgress()
  startNeedleAnimation()
  listenForPageLoad()
})

onUnmounted(() => {
  clearIntervals()
})

// Watchers
watch(() => percentage.value, (newVal) => {
  // Efectos adicionales basados en el progreso
  if (newVal > 50 && newVal < 60) {
    // Cambiar a modo rainbow a la mitad si está habilitado
    // (lógica adicional aquí si necesitas)
  }
})
</script>

<style lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: var(--color-text-primary, #ffffff);
  z-index: 9999;

  &__circle {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #374151;
    border: 3px solid #4b5563;
    margin-bottom: 2rem;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  &__progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: conic-gradient(
      from 0deg,
      var(--color-primary, #3b82f6) 0deg,
      var(--color-primary, #3b82f6) var(--progress-angle, 0deg),
      transparent var(--progress-angle, 0deg),
      transparent 360deg
    );
    border-radius: 50%;
    transition: --progress-angle 0.1s ease-out;
  }

  &__needle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 45px;
    background: linear-gradient(to bottom, #ffffff, var(--color-primary, #3b82f6));
    border-radius: 2px;
    transform-origin: bottom center;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
    z-index: 2;
    transition: transform 0.1s ease-out;

    &::before {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: var(--color-primary, #3b82f6);
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
    }
  }

  &__center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    background: var(--color-primary, #3b82f6);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
  }

  &__percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-primary, #ffffff);
    z-index: 4;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  &__text {
    font-family: "Fira Sans", sans-serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--color-text-primary, #ffffff);
    opacity: 0.9;
    margin-bottom: 1rem;
    animation: pulse 2s ease-in-out infinite;
  }

  &__dots {
    display: flex;
    gap: 0.5rem;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary, #3b82f6);
      animation: bounce 0.6s infinite alternate;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  // Versión rainbow
  &__circle.rainbow &__progress {
    background: conic-gradient(
      from 0deg,
      #ff6b6b 0deg,
      #4ecdc4 60deg,
      #45b7d1 120deg,
      #96ceb4 180deg,
      #feca57 240deg,
      #ff9ff3 300deg,
      #ff6b6b 360deg
    );
    mask: conic-gradient(
      from 0deg,
      black 0deg,
      black var(--progress-angle, 0deg),
      transparent var(--progress-angle, 0deg),
      transparent 360deg
    );
  }
}

// Animaciones
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bounce {
  from {
    transform: translateY(0);
    opacity: 0.7;
  }
  to {
    transform: translateY(-8px);
    opacity: 1;
  }
}

// Transiciones
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.5s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>