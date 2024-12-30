import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { Role } from "@/src/context/shared/constants/roles.constant";
import { Roles } from "@/src/context/shared/guards/roles/roles.decorator";
import { RolesGuard } from "@/src/context/shared/guards/roles/roles.guard";

import { UpdateConfigDto } from "../config/dto/update-config.dto";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { SchedulesService } from "./schedules.service";

@ApiTags("schedules")
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Crear un nuevo horario" })
  @ApiResponse({ status: 201, description: "Horario creado exitosamente." })
  @ApiBody({ type: CreateScheduleDto })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.createSchedule(createScheduleDto);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Obtener todos los horarios" })
  @ApiResponse({ status: 200, description: "Lista de todos los horarios." })
  findAll() {
    return this.schedulesService.getAllSchedules();
  }

  @Get(":id")
  @Roles(Role.Admin, Role.Client)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Obtener un horario por ID" })
  @ApiResponse({ status: 200, description: "Horario encontrado." })
  @ApiResponse({ status: 404, description: "Horario no encontrado." })
  @ApiParam({ name: "id", type: String, description: "ID del horario" })
  findOne(@Param("id") id: string) {
    return this.schedulesService.getSchedule(id);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Actualizar un horario por ID" })
  @ApiResponse({
    status: 200,
    description: "Horario actualizado exitosamente.",
  })
  @ApiResponse({ status: 404, description: "Horario no encontrado." })
  @ApiParam({ name: "id", type: String, description: "ID del horario" })
  @ApiBody({ type: UpdateScheduleDto })
  update(
    @Param("id") id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.updateSchedule(id, updateScheduleDto);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Eliminar un horario por ID" })
  @ApiResponse({ status: 200, description: "Horario eliminado exitosamente." })
  @ApiResponse({ status: 404, description: "Horario no encontrado." })
  @ApiParam({ name: "id", type: String, description: "ID del horario" })
  remove(@Param("id") id: string) {
    return this.schedulesService.deleteSchedule(id);
  }

  @Delete("deleteAll/:id")
  @ApiOperation({ summary: "Eliminar todos los horarios de un Cliente" })
  @ApiResponse({
    status: 200,
    description: "Horarios eliminados exitosamente.",
  })
  @ApiResponse({ status: 404, description: "Horarios no encontrados." })
  @ApiParam({ name: "id", type: String, description: "ID del Cliente" })
  removeAllClientSchedules(@Param("id") id: string) {
    return this.schedulesService.deleteAllClientSchedules(id);
  }

  @Patch("assignClient/:scheduleId")
  @ApiOperation({ summary: "Asignar un Cliente a un Horario" })
  @ApiResponse({
    status: 200,
    description: "Cliente asignado exitosamente.",
  })
  @ApiResponse({ status: 404, description: "Cliente no encontrado." })
  @ApiParam({ name: "scheduleId", type: String, description: "ID del Horario" })
  @ApiParam({ name: "clientId", type: String, description: "ID del Cliente" })
  assignClientToSchedule(
    @Param("scheduleId") scheduleId: string,
    @Body() clientsIds: string[],
  ) {
    return this.schedulesService.assignClientToSchedule(scheduleId, clientsIds);
  }

  @Delete("deleteClient/:scheduleId/:clientId")
  @ApiOperation({ summary: "Eliminar un Cliente de un Horario" })
  @ApiResponse({
    status: 200,
    description: "Cliente eliminado exitosamente.",
  })
  @ApiResponse({ status: 404, description: "Cliente no encontrado." })
  @ApiParam({ name: "scheduleId", type: String, description: "ID del Horario" })
  @ApiParam({ name: "clientId", type: String, description: "ID del Cliente" })
  deleteClientFromSchedule(
    @Param("scheduleId") scheduleId: string,
    @Param("clientId") clientId: string,
  ) {
    return this.schedulesService.deleteClientFromSchedule(scheduleId, clientId);
  }

  @Post("populateSchedules")
  populateSchedulesByConfig() {
    return this.schedulesService.populateSchedulesByConfig();
  }

  @Patch("updateScheduleConfig/:id")
  @ApiOperation({ summary: "Actualizar la configuración de un Horario" })
  @ApiResponse({
    status: 200,
    description: "Configuración de Horario actualizada exitosamente.",
  })
  updateScheduleConfig(
    @Param("id") id: string,
    @Body() updateConfigDto: UpdateConfigDto,
  ) {
    return this.schedulesService.updateScheduleConfig(id, updateConfigDto);
  }
}
