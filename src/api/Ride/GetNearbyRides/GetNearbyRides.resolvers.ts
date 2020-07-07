import { Resolvers } from "../../../types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import User from "../../../entities/User";
import { GetNearbyRidesResponse } from "../../../types/graph";
import { getRepository, Between } from "typeorm";
import Ride from "../../../entities/Ride";

const resolvers: Resolvers = {
  Query: {
    GetNearbyRides: privateResolver(
      async (_, __, { req }): Promise<GetNearbyRidesResponse> => {
        const user: User = req.user;

        // if user driving
        if (user.isDriving) {
          const { lastLat, lastLng } = user;

          try {
            // getRepository : we will get rides filtered
            const rides = await getRepository(Ride).find({
              status: "REQUESTING",
              pickUpLat: Between(lastLat - 0.05, lastLat + 0.05),
              pickUpLng: Between(lastLng - 0.05, lastLng + 0.05),
            });

            return {
              ok: true,
              error: null,
              rides,
            };
          } catch (error) {
            return {
              ok: false,
              error: error.message,
              rides: null,
            };
          }
        } else {
          // if user not driving
          return {
            ok: false,
            error: "You are not a driver or not driving",
            rides: null,
          };
        }
      }
    ),
  },
};

export default resolvers;