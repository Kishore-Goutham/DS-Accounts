import { incomeService } from "../services/income.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";

// Thin HTTP layer: read validated input from req.valid, call one service
// method, send the standard envelope. Errors bubble to asyncHandler.
export const incomeController = {
  async create(req, res) {
    const income = await incomeService.createIncome(req.valid.body);
    sendSuccess(res, income, { statusCode: 201 });
  },

  async list(req, res) {
    const { data, meta } = await incomeService.listIncomes(req.valid.query);
    sendSuccess(res, data, { meta });
  },

  async analytics(req, res) {
    const data = await incomeService.getAnalytics(req.valid.query);
    sendSuccess(res, data);
  },

  async getOne(req, res) {
    const income = await incomeService.getIncome(req.valid.params.id);
    sendSuccess(res, income);
  },

  async update(req, res) {
    const income = await incomeService.updateIncome(req.valid.params.id, req.valid.body);
    sendSuccess(res, income);
  },

  async remove(req, res) {
    const income = await incomeService.deleteIncome(req.valid.params.id);
    sendSuccess(res, income);
  },
};

export default incomeController;
