<template>
  <button
    v-if="show"
    type="button"
    class="btn btn-success"
    v-on:click="addUserGroup"
  >
    Add User to Groups
  </button>
</template>

<script>
import Mixins from "../utils/Mixins.vue";

export default {
  mixins: [Mixins],
  props: {
    user: Object,
    userGroups: Array
  },
  methods: {
    addUserGroup() {
      // Method to create a relationship between a user and a user group
      // Get list of current user groups
      let currentUserGroups = [];
      for (
        let i = 0;
        i < this.user.sysUserGroupMembershipsByUserId.nodes.length;
        i++
      ) {
        currentUserGroups.push(
          this.user.sysUserGroupMembershipsByUserId.nodes[i]["userGroupId"]
        );
      }

      // For selected list of user groups
      // If current user group does not contain the new group, add user to it
      for (let i = 0; i < this.userGroups.length; i++) {
        if (currentUserGroups.includes(this.userGroups[i]) == false) {
          // Method to insert a relationship between a user and a user group
          let payload = {
            query: this.$store.state.mutationCreateUserGroupMembership,
            variables: {
              sysUserGroupMembership: {
                userId: this.user.id,
                userGroupId: this.userGroups[i]
              }
            }
          };
          let headers = {};
          if (this.$session.exists()) {
            headers = { Authorization: "Bearer " + this.$session.get("jwt") };
          }
          this.$http
            .post(this.$store.state.graphqlUrl, payload, { headers })
            .then(
              function(response) {
                if (response.data.errors) {
                  this.displayError(response);
                } else {
                  let userGroupMembership =
                    response.data.data.createSysUserGroupMembership
                      .sysUserGroupMembership;
                  this.$emit("addUserGroupMembership", userGroupMembership);
                }
              },
              // Error callback
              function(response) {
                this.displayError(response);
              }
            );
        }
      }

      // If modified user is the current user, refresh current user groups
      if (this.$session.get("email") == this.user.email) {
        this.refreshCurrentUserGroups();
      }
    },
    refreshCurrentUserGroups() {
      // Method to refresh current user's user groups
      let payload = {
        query: this.$store.state.queryGetCurrentUser,
        variables: { email: this.$session.get("email") }
      };
      let headers = {};
      if (this.$session.exists()) {
        headers = { Authorization: "Bearer " + this.$session.get("jwt") };
      }
      this.$http.post(this.$store.state.graphqlUrl, payload, { headers }).then(
        function(response) {
          if (response.data.errors) {
            this.displayError(response);
          } else {
            // Prepare list of current user groups
            let memberships =
              response.data.data.sysUserByEmail.sysUserGroupMembershipsByUserId
                .nodes;
            let currentUserGroups = [];
            for (let i = 0; i < memberships.length; i++) {
              currentUserGroups.push(
                memberships[i]["sysUserGroupByUserGroupId"]
              );
            }

            // Reset current user groups
            this.$session.set("userGroups", currentUserGroups);
            this.$store.state.currentUser.userGroups = currentUserGroups;
          }
        },
        // Error callback
        function(response) {
          this.displayError(response);
        }
      );
    }
  },
  computed: {
    show() {
      let roles = ["admin"];
      return roles.includes(this.$store.state.currentUser.role);
    }
  }
};
</script>
