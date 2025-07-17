<script>
    let {children, onclick = null, ...props} = $props();
</script>

<button onclick="{onclick}">{@render children()}</button>

<style>
button {
    font-size: 1rem;
    padding: .7rem 2rem;
    border: none;
    border-radius: 2rem;
    background-color: #334882;
    color: white;
}
</style>