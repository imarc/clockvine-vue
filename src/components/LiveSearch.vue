<template>
    <input type="search" :value="internalValue" :class="{'-isTyping': isTyping}"
        @input="input"
        @keyup.enter="$emit('input', value)"
        @click="$emit('input', value)">
</template>
<script>
import debounce from 'lodash/debounce';

/**
 * LiveSearch is a Vue Component for a live search field.
 */
export default {

    data: () => ({
        internalValue: null,
        isTyping: false,
    }),

    methods: {

        input({target: {value}}) {
            this.internalValue = value;
            this.$emit('is-typing', this.isTyping = true);
            return this.$_liveSearch_debouncedInput(value);
        },

        $_liveSearch_debouncedInput: debounce(function(value) {
            this.$emit('is-typing', this.isTyping = false);
            return this.$emit('input', value);
        }, 300),
    },

    props: {
        value: {
            type: String,
            required: true,
        },
    },

    mounted() {
        this.internalValue = this.value;
    },

    watch: {
        value(value) {
            this.internalValue = value;
        },
    },
}
</script>
