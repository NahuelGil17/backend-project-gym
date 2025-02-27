import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { ClientsService } from "@/src/context/clients/clients.service";
import { PlanEntity } from "@/src/context/plans/entities/plan.entity";

import { SCHEDULE_REPOSITORY } from "../schedules/repositories/mongo-schedule.repository";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { PLAN_REPOSITORY } from "./repositories/plans.repository";

@Injectable()
export class PlansService {
  constructor(
    @Inject(forwardRef(() => ClientsService))
    private readonly clientsService: any,
    @Inject(PLAN_REPOSITORY)
    private readonly plansRepository: any,
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: any,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<PlanEntity> {
    return await this.plansRepository.createPlan(createPlanDto);
  }

  async getPlans(page: number, limit: number, name?: string, type?: string) {
    const offset = (page - 1) * limit;
    const filters: any = {};

    if (name) {
      filters.name = { $regex: name, $options: "i" };
    }

    if (type) {
      filters.type = type;
    }

    const [data, total] = await Promise.all([
      this.plansRepository.getPlans(offset, limit, filters),
      this.plansRepository.countPlans(filters),
    ]);
    return { data, total, page, limit };
  }

  findByUserId(userId: string) {
    return this.plansRepository.findByUserId(userId);
  }

  findOne(id: string) {
    return this.plansRepository.findOne(id);
  }

  update(id: string, updatePlanDto: UpdatePlanDto) {
    return this.plansRepository.update(id, updatePlanDto);
  }

  async remove(id: string) {
    const clients = await this.getClientsByPlanId(id);
    if (clients.length > 0) {
      for (const client of clients) {
        await this.updateClientPlan(client._id, "");
      }
    }
    await this.plansRepository.remove(id);
  }

  assignPlanToClient(clientId: string, planId: string) {
    return this.clientsService.assignPlanToClient(clientId, planId);
  }

  async getClientsWithPlansAndSchedules(
    filters: any,
    offset: number,
    limit: number,
  ) {
    // Obtener los clientes paginados
    const clients = await this.clientsService.findAll(offset, limit, filters);

    const clientsWithDetails = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/require-await
      clients.data.map(async (client: any) => {
        // Obtener el plan del cliente basado en su planId
        const plan = client.planId
          ? await this.plansRepository.findOne(client.planId)
          : undefined;

        // Obtener los días asignados en los schedules
        const schedules = await this.scheduleRepository.getSchedules();
        const assignedSchedules = schedules.filter((s: any) =>
          s.clients.includes(client._id),
        );

        return {
          ...client,
          plan,
          assignedSchedules,
        };
      }),
    );

    return clientsWithDetails;
  }

  async findAssignableClientsBasedOnPlan(
    offset: number,
    limit: number,
    email?: string,
  ) {
    const filters: any = {};

    if (email) {
      filters.email = { $regex: email, $options: "i" };
    }
    const clients = await this.getClientsWithPlansAndSchedules(
      filters,
      offset,
      limit,
    );

    const clientsFilter = clients.filter((client: any) => {
      // Días definidos en el plan
      const planDays = client.plan?.days || 0;
      // Días asignados al cliente en los schedules
      const assignedDays =
        client.assignedSchedules?.map((s: any) => s.day) || [];

      // Si la cantidad de días asignados es menor que los días del plan, el cliente es asignable
      return assignedDays.length < planDays && client._doc.role === "User";
    });

    return clientsFilter.map((client: any) => ({
      _id: client._doc._id,
      name: client._doc.userInfo.name,
      CI: client._doc.userInfo.CI,
      email: client._doc.email,
    }));
  }

  getClientsByPlanId(planId: string) {
    return this.clientsService.findClientsByPlanId(planId);
  }

  updateClientPlan(clientId: string, planId: string) {
    return this.clientsService.assignPlanToClient(clientId, planId);
  }
}
