<template>
  <v-container grid-list-lg fluid>
    <v-layout :row="$vuetify.breakpoint.mdAndUp" :column="$vuetify.breakpoint.smAndDown">
      <v-flex sm12 md3>
        <v-card class="pl-3 pt-3 pb-3">
          <div
            @click="showProjects = !showProjects"
            style="cursor: pointer;"
            class="headline"
          >Projects
            <v-btn flat icon class="ma-0 mr-3" style="float: right;">
              <v-icon v-if="showProjects">expand_less</v-icon>
              <v-icon v-else>expand_more</v-icon>
            </v-btn>
          </div>
          <v-treeview
            class="mt-2"
            v-if="projects.length > 0 && showProjects"
            :items="projects"
            item-children="jobCodes"
            open-on-click
            activatable
            :active.sync="activatedJobCodes"
            :open.sync="open"
          ></v-treeview>
          <v-select
            :items="tasks"
            v-model="task"
            label="Task"
            class="pr-3 mt-3"
            item-text="name"
            hide-details
            return-object
          ></v-select>
        </v-card>
      </v-flex>
      <v-flex sm12 md9>
        <v-container class="pa-0" grid-list-lg fluid>
          <v-layout column>
            <v-flex v-if="active && actual">
              <v-card class="pa-3">
                <div class="headline">Working on {{ active.project.name }} - {{ active.name}}</div>
                <v-card-text class="pa-0 pt-2">
                  <div class="d-inline-block" v-if="actual && actual.From">
                    From {{ actual.From | formatTime }}
                    <span
                      v-if="timeWorkingOn"
                    >{{ timeWorkingOn }}</span>
                  </div>
                  <v-btn
                    class="ma-0 ml-2 d-inline-block"
                    small
                    flat
                    @click="activatedJobCodes = []"
                  >Stop</v-btn>
                </v-card-text>
                <v-textarea label="Log" rows="3" v-model="actual.Log"></v-textarea>
              </v-card>
            </v-flex>
            <v-flex v-if="actuals">
              <v-card class="pa-3">
                <v-progress-linear
                  style="position: absolute; left: 0px; top: -15px; z-index: 100"
                  v-if="loadingActuals || loadingBalance"
                  :indeterminate="true"
                ></v-progress-linear>
                <div class="headline mb-2">Actuals
                  <v-btn
                    class="ma-0"
                    style="float: right;"
                    flat
                    icon
                    @click="getActuals(); getBalance();"
                    :disabled="loadingActuals || loadingBalance"
                  >
                    <v-icon>cached</v-icon>
                  </v-btn>
                  <span
                    v-if="balance"
                    class="pr-3"
                    style="float: right; font-size: 1.2rem; padding-top: 2px;"
                    :style="balance < 0 ? 'color: red;' : ''"
                  >Recup: {{ balance }} h</span>
                </div>
                <table class="actuals-date-table">
                  <thead>
                    <th style="width: 45px;">Date</th>
                    <th></th>
                  </thead>
                  <tbody>
                    <tr v-for="date in actuals" :key="date.Group">
                      <td>
                        <div>{{ date.Group | formatDateShort }}</div>
                        <div v-if="!date.Subgroup[0].Duration">{{ calculateTotalHoursForDate(date) | formatDecimal }}</div>
                      </td>
                      <td class="pa-0" colspan="6">
                        <table class="actuals-hours-table push-up">
                          <thead v-if="date.Subgroup[0].Duration">
                            <th>Absence</th>
                          </thead>
                          <thead v-if="!date.Subgroup[0].Duration">
                            <th style="width: 40px;">From</th>
                            <th style="width: 40px;">Until</th>
                            <th style="width: 45px;">Hours</th>
                            <th style="width: 20%;">Project</th>
                            <th v-if="$vuetify.breakpoint.lgAndUp" style="width: 20%;">Job Code</th>
                            <th v-if="$vuetify.breakpoint.xlAndUp" style="width: 20%;">Task</th>
                            <th>Log</th>
                            <th></th>
                          </thead>
                          <tbody>
                            <!-- Absence -->
                            <tr v-if="actual.Duration" v-for="actual in date.Subgroup" :key="actual.Id">
                              <td>
                                {{ actual.Title }}
                                <span v-if="actual.Title === 'Jaarlijks verlof - Betaald'">😎</span>
                                <span v-else-if="actual.Title === 'ZK'">
                                  <span v-if="Math.ceil(Math.random() * 6) === 1">😷</span>
                                  <span v-if="Math.ceil(Math.random() * 6) === 2">🤒</span>
                                  <span v-if="Math.ceil(Math.random() * 6) === 3">🤕</span>
                                  <span v-if="Math.ceil(Math.random() * 6) === 4">🤢</span>
                                  <span v-if="Math.ceil(Math.random() * 6) === 5">🤮</span>
                                  <span v-if="Math.ceil(Math.random() * 6) === 6">🤧</span>
                                </span>
                              </td>
                            </tr>
                            <!-- Actual -->
                            <tr v-if="!actual.Duration" v-for="actual in date.Subgroup" :key="actual.Id">
                              <td>{{ actual.From | formatTime }}</td>
                              <td>{{ actual.Until | formatTime }}</td>
                              <td>{{ actual.TotalHour | formatDecimal }}</td>
                              <td>{{ actual.Project.Project }}</td>
                              <td
                                v-if="$vuetify.breakpoint.lgAndUp"
                              >{{ actual.JobCode.Description }}</td>
                              <td
                                v-if="$vuetify.breakpoint.xlAndUp"
                              >{{ actual.Assignment.Description }}</td>
                              <td style="white-space: pre">{{ actual.Log }}</td>
                              <th>
                                <v-btn
                                  style="float: right;"
                                  small
                                  class="ma-0 delete-button"
                                  flat
                                  icon
                                  @click="deleteActual(actual);"
                                  color="grey lighter-1"
                                >
                                  <v-icon>delete</v-icon>
                                </v-btn>
                              </th>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style scoped>
.actuals-date-table {
  width: 100%;
  text-align: left;
  vertical-align: top;
}
.actuals-date-table td {
  padding: 1px;
  vertical-align: top !important;
}
.actuals-hours-table {
  width: 100%;
}
.push-up {
  position: relative;
  top: -25px;
}
</style>

<style>
.v-treeview-node--leaf {
  margin-left: 30px !important;
}
</style>

<script>
import moment from "moment";

export default {
  data() {
    return {
      showProjects: true,
      projects: JSON.parse(localStorage.getItem("projects")) || [],
      jobCodes: JSON.parse(localStorage.getItem("jobCodes")) || [],
      tasks: JSON.parse(localStorage.getItem("tasks")) || [],
      task: JSON.parse(localStorage.getItem("task")) || {
        id: 100,
        name: "Realisatie/programmatie"
      },
      activatedJobCodes:
        JSON.parse(localStorage.getItem("activatedJobCodes")) || [],
      active: null,
      open: JSON.parse(localStorage.getItem("open")) || [],
      loadingActuals: false,
      actuals: JSON.parse(localStorage.getItem("actuals")) || [],
      actual: JSON.parse(localStorage.getItem("actual")) || null,
      loadingBalance: false,
      balance: parseFloat(localStorage.getItem("balance"), 2) || null,
      timeWorkingOn: null,
      timeWorkingOnInterval: null
    };
  },
  mounted() {
    this.getProjects();
    this.getActuals();
    this.getBalance();

    this.timeWorkingOnInterval = setInterval(
      this.updateCurrentTimeWorkingOn,
      1000
    );
  },
  destroyed: function() {
    clearInterval(this.timeWorkingOnInterval);
  },
  methods: {
    getProjects() {
      // Only if user ID is defined
      if (!this.$user || !this.$user.Id) return;

      this.$axios
        .get(
          process.env.VUE_APP_API +
            "/project/GetProjects?userid=" +
            this.$user.Id
        )
        .then(response => {
          // console.log(JSON.parse(JSON.stringify(response.data.Data)));

          // Cleanup data from API

          // TASKS
          // Convert
          let tasks = response.data.Data[0].JobCodes[0].Assignments.map(t => {
            return {
              id: t.Id,
              name:
                t.Description.charAt(0).toUpperCase() +
                t.Description.toLowerCase().slice(1)
            };
          });

          // Sort
          tasks = tasks.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase()
              ? 1
              : b.name.toLowerCase() > a.name.toLowerCase()
              ? -1
              : 0
          );

          // Default first task => 100 === "Realisatie/programmatie"
          // TODO Add setting
          tasks.forEach((t, i) => {
            if (t.id === 100) {
              var item = tasks.splice(i, 1); // Remove item
              tasks.unshift(item[0]); // Add item to front
            }
          });
          this.tasks = tasks;

          // PROJECTS
          // Convert
          let projects = response.data.Data.map(p => {
            return {
              id: p.ProjectId,
              name: p.Project,
              jobCodes: p.JobCodes.map(j => {
                return {
                  id: j.JobCodeId,
                  name: j.Description,
                  description: j.LongDescription
                };
              })
            };
          });

          // Sort
          projects = projects.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase()
              ? 1
              : b.name.toLowerCase() > a.name.toLowerCase()
              ? -1
              : 0
          );

          let jobCodes = [];
          projects.forEach(p => {
            p.jobCodes = p.jobCodes.sort((a, b) =>
              a.name.toLowerCase() > b.name.toLowerCase()
                ? 1
                : b.name.toLowerCase() > a.name.toLowerCase()
                ? -1
                : 0
            );

            // Also add jobCodes of all projects to global list in this forEach
            jobCodes.push(
              ...p.jobCodes.map(j => {
                return { ...j, project: { id: p.id, name: p.name } };
              })
            );
          });
          this.projects = projects;
          this.jobCodes = jobCodes;
        });
    },
    jobCodeById(id) {
      if (!id) {
        return id;
      }
      return this.jobCodes.filter(j => {
        return j.id === id;
      })[0];
    },
    getActuals() {
      // Only if user ID is defined
      if (!this.$user || !this.$user.Id) return;

      // Start loading
      this.loadingActuals = true;

      let postBody = {
        // TODO: Add setting
        From: moment()
          .add(-2, "days")
          .format("YYYY-MM-DD"),
        To: moment().format("YYYY-MM-DD"),
        JobcodeIds: this.jobCodes.map(j => j.id),
        UserVM: [this.$user],
        Skip: 0,
        Take: 200
      };

      this.$axios
        .post(
          process.env.VUE_APP_API + "/Actual/GetActualsAndAbsents",
          postBody
        )
        .then(response => {
          // Stop loading
          this.loadingActuals = false;

          this.actuals = response.data.Data;
        });

      // Refresh recup balance
      this.getBalance();
    },
    createActual() {
      // Only if user ID and actual are defined
      if (!this.$user || !this.$user.Id || !this.actual) return;

      // Set actual values
      this.actual.Until = this.nearestMinutes(5, moment()).toISOString();
      // When From and Until are the same, add 5 minutes to Until
      if (this.actual.From === this.actual.Until) {
        this.actual.Until = moment(this.actual.Until)
          .add(5, "minutes")
          .toISOString();
      }
      this.actual.Assignment = {
        Id: this.task.id,
        Description: this.task.name
      };
      this.actual.TotalHour = moment
        .duration(moment(this.actual.Until).diff(moment(this.actual.From)))
        .asHours();

      return this.$axios
        .post(process.env.VUE_APP_API + "/actual/Create", {
          Assignment: this.actual.Assignment,
          CompanyCarDistance: 0,
          CompensationDistance: 0,
          Date:
            moment(this.actual.From)
              .add(1, "hours")
              .toISOString()
              .slice(0, -1) + "+0100", // Shit
          From:
            moment(this.actual.From)
              .add(1, "hours")
              .toISOString()
              .slice(0, -1) + "+0100", // Shit
          Until:
            moment(this.actual.Until)
              .add(1, "hours")
              .toISOString()
              .slice(0, -1) + "+0100", // Shit
          JobCode: {
            JobCodeId: this.actual.JobCode.Id
          },
          Locked: false,
          Log: this.actual.Log,
          Person: {
            Id: this.$user.Id
          },
          Project: {
            ProjectId: this.actual.Project.ProjectId
          },
          PublicTransport: false,
          SocAb: false,
          TotalHour: this.actual.TotalHour
        })
        .then(() => {
          this.getActuals();
          // Reset the actual
          this.actual = null;
        });
    },
    deleteActual(actual) {
      // Only if user ID and actual are defined
      if (!this.$user || !this.$user.Id || !actual) return;

      if (confirm(this.$user.Name.split(" ").pop() + ", are you sure?")) {
        this.$axios
          .delete(process.env.VUE_APP_API + "/actual/Delete/" + actual.Id)
          .then(() => {
            this.getActuals();
          });
      }
    },
    getBalance() {
      // Only if user ID is defined
      if (!this.$user || !this.$user.Id) return;

      // Start loading
      this.loadingBalance = true;

      this.$axios
        .post(process.env.VUE_APP_API + "/actual/GetRecupInfo", {
          id: this.$user.Id
        })
        .then(response => {
          // Stop loading
          this.loadingBalance = false;

          this.balance = response.data.Data.CalculatedTime;
        });
    },
    calculateTotalHoursForDate(date) {
      let total = 0;

      if (!date) {
        return total;
      }

      date.Subgroup.forEach(actual => {
        total += actual.TotalHour;
      });

      return total;
    },
    nearestPastMinutes(interval, someMoment) {
      const roundedMinutes =
        Math.floor(someMoment.minute() / interval) * interval;
      return someMoment
        .clone()
        .minute(roundedMinutes)
        .second(0)
        .milliseconds(0);
    },
    nearestMinutes(interval, someMoment) {
      const roundedMinutes =
        Math.round(someMoment.clone().minute() / interval) * interval;
      return someMoment
        .clone()
        .minute(roundedMinutes)
        .second(0)
        .milliseconds(0);
    },
    nearestFutureMinutes(interval, someMoment) {
      const roundedMinutes =
        Math.ceil(someMoment.minute() / interval) * interval;
      return someMoment
        .clone()
        .minute(roundedMinutes)
        .second(0)
        .milliseconds(0);
    },
    updateCurrentTimeWorkingOn() {
      if (this.actual && this.actual.From) {
        let duration;
        let now = moment();
        let from = moment(this.actual.From);

        this.timeWorkingOn = "";

        if (this.nearestMinutes(5, now) > from) {
          this.timeWorkingOn +=
            "- " + this.nearestMinutes(5, now).format("HH:mm") + " (";
        } else {
          this.timeWorkingOn += "(";
        }

        if (now >= from) {
          duration = moment.duration(now.diff(from));
          this.timeWorkingOn += moment
            .utc(duration.asMilliseconds())
            .format("HH:mm:ss");
        } else {
          duration = moment.duration(from.diff(now));
          this.timeWorkingOn += moment
            .utc(duration.asMilliseconds())
            .format("-mm:ss");
        }

        this.timeWorkingOn += ")";
      } else {
        this.timeWorkingOn = null;
      }
    }
  },
  watch: {
    projects(value) {
      localStorage.setItem("projects", JSON.stringify(value));
    },
    jobCodes(value) {
      localStorage.setItem("jobCodes", JSON.stringify(value));
    },
    tasks(value) {
      localStorage.setItem("tasks", JSON.stringify(value));
    },
    task(value) {
      localStorage.setItem("task", JSON.stringify(value));
    },
    open(value) {
      localStorage.setItem("open", JSON.stringify(value));
    },
    activatedJobCodes(value) {
      localStorage.setItem("activatedJobCodes", JSON.stringify(value));
      this.active = this.jobCodeById(value[0] || null);
    },
    actuals(value) {
      localStorage.setItem("actuals", JSON.stringify(value));
    },
    async active(value) {
      // First or changed active Job code
      if (value) {
        // When active changes add current actual
        if (this.actual && this.actual.JobCode.Id !== value.id) {
          await this.createActual();
        }
        if (
          !localStorage.getItem("actual") ||
          JSON.parse(localStorage.getItem("actual")) === null ||
          JSON.parse(localStorage.getItem("actual")).JobCode.Id !== value.id
        ) {
          // New actual
          this.actual = {
            From: this.nearestMinutes(5, moment()).toISOString(),
            JobCode: { Id: value.id, Description: value.name },
            Project: {
              ProjectId: value.project.id,
              Project: value.project.name
            }
          };
        }
      } else {
        // When deselecting or stop working (active), stop and create actual
        this.createActual();
      }
    },
    actual: {
      handler: function(value) {
        localStorage.setItem("actual", JSON.stringify(value));
      },
      deep: true
    },
    balance(value) {
      localStorage.setItem("balance", JSON.stringify(value));
    }
  },
  name: "Ractuals"
};
</script>
