export const queryGetAllUserGroups = `query getAllUserGroups{
    allSysUserGroups(orderBy: NAME_ASC) {
        nodes {
            id
            name
        }
    }
}`;

export const queryGetUserGroup = `query getUserGroup($id: Int!) {
    sysUserGroupById(id: $id) {
        id
        name
        createdDate
        updatedDate
        sysUserByCreatedById { email }
        sysUserByUpdatedById { email }
    }
}`;

// Response labels must be formatted according to Treeselect requirements
export const queryGetUserUserGroups = `query getAllUserGroups {
    allSysUserGroups(orderBy: NAME_ASC) {
        nodes {
            id
            label:name
        }
    }
}`;

export const mutationCreateUserGroup = `mutation createUserGroup($sysUserGroup: SysUserGroupInput!) {
    createSysUserGroup(input: {sysUserGroup: $sysUserGroup}) {
        sysUserGroup {
            id
        }
    }
}`;

export const mutationUpdateUserGroup = `mutation updateUserGroup($id: Int!, $sysUserGroupPatch: SysUserGroupPatch!) {
    updateSysUserGroupById(input: {id: $id, sysUserGroupPatch: $sysUserGroupPatch }) {
        sysUserGroup {
            id
        }
    }
}`;

export const mutationSearchUserGroup = `mutation searchUserGroup($keyword: String) {
    searchUserGroup(input: {keyword: $keyword}) {
        sysUserGroups {
            id
            name
        }
    }
}`;