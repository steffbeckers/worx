<template>
  <div class="ma-1">
    <div class="pa-1" v-for="project in projects" :key="project.ProjectId">{{ project.Project }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projects: JSON.parse(localStorage.getItem("projects")) || []
    };
  },
  mounted() {
    this.getProjects();
  },
  methods: {
    getProjects() {
      // Only if user ID is defined
      if (!window.user || !window.user.Id) return;

      this.$axios
        .get(
          process.env.VUE_APP_API +
            "/project/GetProjects?userid=" +
            window.user.Id
        )
        .then(response => {
          this.projects = response.data;
        })
    }
  },
  watch: {
    projects(value) {
      // Save to local storage
      localStorage.setItem("projects", JSON.stringify(value));
    }
  },
  name: "Ractuals"
};
</script>
