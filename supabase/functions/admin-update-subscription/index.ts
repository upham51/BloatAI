import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-UPDATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");
    logStep("User authenticated", { adminId: adminUser.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      logStep("Unauthorized: User is not an admin", { userId: adminUser.id });
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin verified");

    // Parse request body
    const { targetUserId, action, plan } = await req.json();

    if (!targetUserId || !action) {
      throw new Error("Missing required fields: targetUserId and action");
    }

    logStep("Request parsed", { targetUserId, action, plan });

    let updateData: any = {};
    let actionDetails: any = { action, plan };

    // Determine what to update based on action
    if (action === 'grant') {
      if (!plan || (plan !== 'annual' && plan !== 'monthly')) {
        throw new Error("Invalid plan. Must be 'annual' or 'monthly'");
      }

      // Set subscription to "lifetime" (100 years from now)
      const lifetimeDate = new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);

      updateData = {
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_ends_at: lifetimeDate.toISOString(),
        admin_granted_by: adminUser.id,
        admin_granted_at: new Date().toISOString(),
      };

      actionDetails.subscription_ends_at = lifetimeDate.toISOString();
      logStep("Granting subscription", updateData);

    } else if (action === 'revoke') {
      updateData = {
        subscription_status: 'inactive',
        subscription_plan: null,
        subscription_ends_at: new Date().toISOString(),
        admin_granted_by: null,
        admin_granted_at: null,
      };

      logStep("Revoking subscription", updateData);

    } else {
      throw new Error("Invalid action. Must be 'grant' or 'revoke'");
    }

    // Update the user's profile
    const { data: profileData, error: updateError } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Profile updated successfully", { profileId: profileData.id });

    // Log the admin action
    const { error: logError } = await supabaseClient
      .from('admin_actions')
      .insert({
        admin_id: adminUser.id,
        target_user_id: targetUserId,
        action_type: action === 'grant' ? 'grant_subscription' : 'revoke_subscription',
        action_details: actionDetails,
      });

    if (logError) {
      logStep("Warning: Failed to log admin action", { error: logError });
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      profile: profileData,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message.includes("Unauthorized") ? 403 : 500,
    });
  }
});
