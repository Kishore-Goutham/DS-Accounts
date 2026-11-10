import { paymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";

// Thin HTTP layer: read validated input from req.valid, call one service
// method, send the standard envelope. Errors bubble to asyncHandler.
export const paymentController = {
  async create(req, res) {
    const payment = await paymentService.createPayment(req.valid.body);
    sendSuccess(res, payment, { statusCode: 201 });
  },

  async list(req, res) {
    const { data, meta } = await paymentService.listPayments(req.valid.query);
    sendSuccess(res, data, { meta });
  },

  async analytics(req, res) {
    const data = await paymentService.getAnalytics(req.valid.query);
    sendSuccess(res, data);
  },

  async sources(req, res) {
    const data = await paymentService.listSources();
    sendSuccess(res, data);
  },

  async getOne(req, res) {
    const payment = await paymentService.getPayment(req.valid.params.id);
    sendSuccess(res, payment);
  },

  async update(req, res) {
    const payment = await paymentService.updatePayment(req.valid.params.id, req.valid.body);
    sendSuccess(res, payment);
  },

  async remove(req, res) {
    const payment = await paymentService.deletePayment(req.valid.params.id);
    sendSuccess(res, payment);
  },
};

export default paymentController;
