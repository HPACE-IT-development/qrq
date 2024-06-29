<template>
  <article class='flex justify-center items-center h-10'>
    <div
      class="
        inline-block
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-solid
        border-current
        text-blue-700
        border-e-transparent
        align-[-0.125em]
        text-surface
        motion-reduce:animate-[spin_1.5s_linear_infinite]
        dark:text-white"
      role="status"
    >
      <span
        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >
        Loading...
      </span>
    </div>
  </article>
</template>
