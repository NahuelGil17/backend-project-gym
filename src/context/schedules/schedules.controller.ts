import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { SchedulesService } from "./schedules.service";

@ApiTags("schedules") // Etiqueta para Swagger
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo horario" })
  @ApiResponse({ status: 201, description: "Horario creado exitosamente." })
  @ApiBody({ type: CreateScheduleDto })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.createSchedule(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los horarios" })
  @ApiResponse({ status: 200, description: "Lista de todos los horarios." })
  findAll() {
    return this.schedulesService.getAllSchedules();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un horario por ID" })
  @ApiResponse({ status: 200, description: "Horario encontrado." })
  @ApiResponse({ status: 404, description: "Horario no encontrado." })
  @ApiParam({ name: "id", type: String, description: "ID del horario" })
  findOne(@Param("id") id: string) {
    return this.schedulesService.getSchedule(id);
  }

  @Patch(":id")
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
}
