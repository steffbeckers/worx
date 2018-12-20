<template>
  <v-app>
    <v-toolbar color="primary" dark app>
      <img class="mr-3" src="@/assets/X.svg">
      <v-toolbar-items>
        <v-btn :to="{name: 'Ractuals'}" exact flat>Ractuals</v-btn>
        <v-btn :to="{name: 'Settings'}" exact flat>Settings</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <span class="mr-4" v-if="user && $vuetify.breakpoint.mdAndUp">Hi {{ firstName }}!</span>
      <v-icon v-if="user" class="mr-4">lock_open</v-icon>
      <v-icon v-else class="mr-4">vpn_key</v-icon>
      <v-text-field class="pb-3" style="max-width: 250px;" v-model="token" hide-details clearable placeholder="Paste token"></v-text-field>
    </v-toolbar>
    <v-content>
      <router-view v-if="user"></router-view>
      <v-container v-else grid-list-xs fluid>
        <v-layout col>
          <v-flex xs12>
            <v-alert :value="true" type="info">Authenticate first by providing an access token.</v-alert>
          </v-flex>
        </v-layout>
      </v-container>
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
      if (this.user && this.user.Name) {
        return this.user.Name.split(" ").pop() || "";
      }
      return null;
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
          this.user = response.data.Data;
        })
        .catch(() => {
          // When error, the token must be incorrect or became invalid
          this.token = null;
        });
    }
  },
  watch: {
    token(value) {
      // When token changes, update the user
      this.user = null;
      if (this.$user) {
        delete this.$user;
      }

      // If token is cleared, clear localStorage and do nothing else
      if (!value) {
        localStorage.clear();
        return;
      }

      // Save to local storage
      localStorage.setItem("token", value);
      // Update in axios
      this.$axios.defaults.headers.common["Authorization"] = "Bearer " + value;
      
      this.getUser();
    },
    user(value) {
      // Save to local storage
      localStorage.setItem("user", JSON.stringify(value));
      // Update in window global var
      this.$user = value;
    }
  },
  name: "App"
};
</script>
