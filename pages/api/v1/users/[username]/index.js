import { createRouter } from "next-connect";
import controller from "infra/controler";
import user from "models/user";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const { username } = request.query;
  const userFound = await user.findOneByUsername(username);
  response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const { username } = request.query;
  const userInputValues = request.body;
  const userUpdated = await user.update(username, userInputValues);
  response.status(200).json(userUpdated);
}
