import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import { UserState } from "../firesinit";
import GameSession from "../views/GameSession.vue";
import CharacterSheet from "../views/CharacterSheet.vue";
import Testing from "../views/Testing.vue";
import Login from "../views/Login.vue";

// beforeEnter: async (to, from, next) => {
//   const userstate = await UserState();

//   if (!userstate) {
//     next(`/login/${to.params.id}`);
//   } else {
//     next();
//   }
// },

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { loggedin: false },
  },
  {
    path: "/session/:id",
    name: "GameSession",
    component: GameSession,
    meta: { loggedin: false },
  },
  {
    path: "/sheet",
    name: "CharacterSheet",
    component: CharacterSheet,
    meta: { loggedin: false },
  },
  {
    path: "/testing",
    name: "Testing",
    component: Testing,
    meta: { loggedin: false },
  },
  {
    path: "/login/:id",
    name: "Login",
    component: Login,
    meta: { loggedin: false },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userstate = await UserState();
  const loggedin = to.matched.some((routepath) => routepath.meta.loggedin);
  const loggedout = to.matched.some((routepath) => routepath.meta.loggedout);

  if (!userstate && loggedin) next("/");
  else if (userstate && loggedout) next("/");
  else next();
});

export default router;
