import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Gift,
  Percent,
  ChevronDown,
  ChevronUp,
  Edit3,
  X,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { AppliedScheme, SchemeCalculationResult } from '@/hooks/useSchemeEngine';

interface AppliedSchemesDisplayProps {
  result: SchemeCalculationResult;
  canOverride?: boolean;
  onOverride?: (schemeId: string, newDiscount: number, newFreeQty: number, reason: string) => void;
  onRemoveOverride?: (schemeId: string) => void;
  isOverridden?: (schemeId: string) => boolean;
}

export function AppliedSchemesDisplay({
  result,
  canOverride = false,
  onOverride,
  onRemoveOverride,
  isOverridden,
}: AppliedSchemesDisplayProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingScheme, setEditingScheme] = useState<string | null>(null);
  const [overrideDiscount, setOverrideDiscount] = useState('');
  const [overrideFreeQty, setOverrideFreeQty] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const { appliedSchemes, totalDiscount, totalFreeGoods } = result;

  if (appliedSchemes.length === 0) {
    return null;
  }

  const handleOverrideSubmit = (schemeId: string) => {
    if (!overrideReason.trim()) {
      return;
    }
    onOverride?.(
      schemeId,
      parseFloat(overrideDiscount) || 0,
      parseInt(overrideFreeQty) || 0,
      overrideReason
    );
    setEditingScheme(null);
    setOverrideDiscount('');
    setOverrideFreeQty('');
    setOverrideReason('');
  };

  const getSchemeIcon = (scheme: AppliedScheme) => {
    if (scheme.freeQuantity > 0 || scheme.freeProducts.length > 0) {
      return <Gift size={14} className="text-success" />;
    }
    return <Percent size={14} className="text-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-success/5 border border-success/20 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-success/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-success" />
          <span className="font-medium text-success">
            {appliedSchemes.length} Scheme{appliedSchemes.length > 1 ? 's' : ''} Applied
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-success">
            -₹{totalDiscount.toLocaleString()}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-success/20"
          >
            <div className="p-3 space-y-2">
              {appliedSchemes.map((scheme) => (
                <div key={scheme.schemeId} className="relative">
                  <div
                    className={`flex items-start justify-between p-2 rounded-md ${
                      isOverridden?.(scheme.schemeId)
                        ? 'bg-warning/10 border border-warning/20'
                        : 'bg-background/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 flex-1">
                      {getSchemeIcon(scheme)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {scheme.schemeName}
                          </p>
                          {scheme.schemeCode && (
                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                              {scheme.schemeCode}
                            </span>
                          )}
                          {isOverridden?.(scheme.schemeId) && (
                            <span className="text-xs px-1.5 py-0.5 bg-warning/20 text-warning rounded flex items-center gap-1">
                              <Edit3 size={10} />
                              Overridden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {scheme.description}
                        </p>
                        {scheme.freeProducts.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {scheme.freeProducts.map((fp, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full"
                              >
                                +{fp.quantity} {fp.productName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {scheme.discountAmount > 0 && (
                        <span className="text-sm font-semibold text-success">
                          -₹{scheme.discountAmount.toLocaleString()}
                        </span>
                      )}
                      {scheme.freeQuantity > 0 && (
                        <span className="text-xs px-2 py-1 bg-success/10 text-success rounded">
                          +{scheme.freeQuantity} Free
                        </span>
                      )}

                      {canOverride ? (
                        <div className="flex items-center gap-1">
                          {isOverridden?.(scheme.schemeId) ? (
                            <button
                              onClick={() => onRemoveOverride?.(scheme.schemeId)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive"
                              title="Remove override"
                            >
                              <X size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingScheme(scheme.schemeId)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground"
                              title="Override scheme"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <Lock size={12} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Override Form */}
                  {editingScheme === scheme.schemeId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 bg-warning/5 border border-warning/20 rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-warning" />
                        <span className="text-sm font-medium text-warning">
                          Override Scheme Benefits
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-muted-foreground">New Discount (₹)</label>
                          <input
                            type="number"
                            value={overrideDiscount}
                            onChange={(e) => setOverrideDiscount(e.target.value)}
                            placeholder={scheme.discountAmount.toString()}
                            className="input-field text-sm py-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">New Free Qty</label>
                          <input
                            type="number"
                            value={overrideFreeQty}
                            onChange={(e) => setOverrideFreeQty(e.target.value)}
                            placeholder={scheme.freeQuantity.toString()}
                            className="input-field text-sm py-1"
                          />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="text-xs text-muted-foreground">Reason (Required)*</label>
                        <input
                          type="text"
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="Enter reason for override..."
                          className="input-field text-sm py-1"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingScheme(null)}
                          className="text-xs px-2 py-1 hover:bg-muted rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleOverrideSubmit(scheme.schemeId)}
                          disabled={!overrideReason.trim()}
                          className="text-xs px-2 py-1 bg-warning text-warning-foreground rounded disabled:opacity-50"
                        >
                          Apply Override
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Free Goods Summary */}
              {totalFreeGoods.length > 0 && (
                <div className="mt-3 pt-3 border-t border-success/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Free Goods Included:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {totalFreeGoods.map((fg, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-success/10 text-success rounded-full flex items-center gap-1"
                      >
                        <Gift size={12} />
                        {fg.quantity}x {fg.productName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
