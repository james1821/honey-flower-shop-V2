<template>
  <div class="money-picker">
    <div class="picker-header">
      <span class="picker-icon">💵</span>
      <div>
        <h4>Choose Cash Amount</h4>
        <p>This cash will be placed inside the bouquet. It's charged to you on top of the bouquet price.</p>
      </div>
    </div>

  
    <div class="quick-chips">
      <button
        v-for="preset in presets"
        :key="preset"
        class="chip"
        :class="{ active: modelValue === preset }"
        @click="$emit('update:modelValue', preset)"
      >
        {{ fmt(preset) }}
      </button>
    </div>

  
    <div class="custom-row">
      <span class="currency-symbol">₱</span>
      <input
        type="number"
        class="form-input custom-input"
        :value="modelValue"
        :min="minAmount"
        :max="maxAmount"
        :step="step"
        placeholder="Or enter custom amount"
        @input="onInput"
      />
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-else class="form-hint">Min: {{ fmt(minAmount) }} · Max: {{ fmt(maxAmount) }} · Step: {{ fmt(step) }}</p>

    <div v-if="modelValue" class="money-summary">
      <div class="sum-line">
        <span>Bouquet price</span>
        <span>{{ fmt(bouquetPrice) }}</span>
      </div>
      <div class="sum-line highlight">
        <span>Cash inside bouquet</span>
        <span>{{ fmt(modelValue) }}</span>
      </div>
      <div class="sum-line total">
        <span>You pay total</span>
        <span>{{ fmt(bouquetPrice + modelValue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  minAmount: number
  maxAmount: number
  step: number
  bouquetPrice: number
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const { fmt } = useCurrency()

const error = ref('')


const presets = computed(() => {
  const s = props.step
  const candidates = [s, s * 2, s * 4, s * 8, s * 16, s * 32]
  return candidates.filter(v => v >= props.minAmount && v <= props.maxAmount).slice(0, 6)
})

function onInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  error.value = ''
  if (val < props.minAmount) { error.value = `Minimum is ${fmt(props.minAmount)}`; return }
  if (val > props.maxAmount) { error.value = `Maximum is ${fmt(props.maxAmount)}`; return }
  emit('update:modelValue', val)
}
</script>

<style scoped>
.money-picker {
  background: linear-gradient(135deg, #fffdf5 0%, #fdf5e0 100%);
  border: 1.5px solid #e8d48a;
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.picker-header { display:flex; gap:14px; align-items:flex-start; }
.picker-icon { font-size:28px; flex-shrink:0; }
.picker-header h4 { font-size:16px; font-weight:600; color:#7a5c10; margin-bottom:3px; }
.picker-header p  { font-size:13px; color:#9a7c30; line-height:1.5; }
.quick-chips { display:flex; flex-wrap:wrap; gap:8px; }
.chip {
  padding: 8px 16px; border-radius: var(--radius-full);
  border: 1.5px solid #e8d48a; background: #fff;
  font-size: 14px; font-weight: 600; color: #7a5c10;
  cursor: pointer; transition: all var(--t);
}
.chip:hover, .chip.active { background: var(--gold); border-color: var(--gold); color: #fff; }
.custom-row { display:flex; align-items:center; gap:0; }
.currency-symbol {
  background:#fff; border:1.5px solid #e8d48a; border-right:none;
  border-radius:var(--radius-md) 0 0 var(--radius-md);
  padding:10px 12px; font-weight:700; color:#7a5c10;
}
.custom-input {
  border-radius:0 var(--radius-md) var(--radius-md) 0 !important;
  border-color:#e8d48a !important;
}
.custom-input:focus { border-color: var(--gold) !important; }
.money-summary {
  background:#fff; border-radius:var(--radius-md); border:1px solid #e8d48a;
  padding:14px 16px; display:flex; flex-direction:column; gap:8px;
}
.sum-line { display:flex; justify-content:space-between; font-size:14px; color:var(--gray); }
.sum-line.highlight { color:var(--gold); font-weight:600; }
.sum-line.total { font-size:16px; font-weight:700; color:var(--charcoal); border-top:1px solid #e8d48a; padding-top:8px; }
</style>
