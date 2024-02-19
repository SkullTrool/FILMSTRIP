const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

function userJoin(id, username, room) {
    const user = { id, username, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function getCurrentUser(id) {
    return UsersState.users.find(user => user.id === id)
}

function userLeave(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getRoomUsers(room) {
    return UsersState.users.filter(user => user.room === room)
}


module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}