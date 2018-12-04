<template>
  <v-app>
    <v-toolbar color="primary" dark app>
      <img class="mr-3" src="@/assets/X.svg">
      <v-toolbar-items>
        <v-btn :to="{name: 'Ractuals'}" exact flat>Ractuals</v-btn>
        <v-btn :to="{name: 'Settings'}" exact flat>Settings</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <span class="mr-4" v-if="user">Hi {{ firstName }}!</span>
      <v-text-field style="max-width: 200px;" v-model="token" clearable placeholder="Token"></v-text-field>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user")) || null
    };
  },
  computed: {
    firstName() {
      return this.user.Name.split(' ').pop() || '';
    }
  },
  mounted() {
    // Request user based on access token
    this.getUser();

    // Base page
    if (this.$route.fullPath === "/") {
      this.$router.push({ name: "Ractuals" });
    }
  },
  methods: {
    getUser() {
      // When user already here or no token provided => do nothing
      if (this.user || !this.token) {
        return;
      }

      this.$axios
        .get(process.env.VUE_APP_API + "/User/GetUser")
        .then(response => {
          this.user = response.data;
          // Force reload?
          // location.reload();
        })
        .catch(() => {
          // When error, the token must be incorrect or became invalid
          this.token = null;
        });
    }
  },
  watch: {
    token(value) {
      // Save to local storage
      localStorage.setItem("token", value);
      // Update in axios
      this.$axios.defaults.headers.common["Authorization"] = 'Bearer ' + value;
      // When token changes, update the user
      this.user = null;
      if (window.user) {
        delete window.user;
      }
      this.getUser();
    },
    user(value) {
      // Save to local storage
      localStorage.setItem("user", JSON.stringify(value));
      // Update in window global var
      window.user = value;
    }
  },
  name: "App"
};
</script>
